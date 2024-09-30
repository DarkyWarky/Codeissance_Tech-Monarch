const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

const transporter = nodemailer.createTransport({
  // Configure your email service here
});

exports.sendAccessRequest = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { aliasId } = data;
  const aliasDoc = await admin.firestore().collection('aliases').doc(aliasId).get();
  const alias = aliasDoc.data();

  if (!alias || alias.userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Invalid alias or permission denied');
  }

  const userDoc = await admin.firestore().collection('users').doc(alias.userId).get();
  const user = userDoc.data();

  const mailOptions = {
    from: 'Your App <noreply@yourapp.com>',
    to: user.email,
    subject: 'Credential Access Request',
    text: `Your alias (${alias.aliasEmail}) has requested access to your credentials. If you do not respond within 48 hours, access will be automatically granted.`
  };

  await transporter.sendMail(mailOptions);

  // Set a timer to grant access after 48 hours
  await admin.firestore().collection('accessRequests').add({
    aliasId,
    userId: alias.userId,
    requestedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(new Date(Date.now() + 48 * 60 * 60 * 1000))
  });

  return { success: true };
});

exports.checkExpiredRequests = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const expiredRequests = await admin.firestore().collection('accessRequests')
    .where('expiresAt', '<=', now)
    .where('status', '==', 'pending')
    .get();

  const batch = admin.firestore().batch();

  expiredRequests.forEach(doc => {
    const request = doc.data();
    batch.update(doc.ref, { status: 'granted' });
    batch.update(admin.firestore().collection('aliases').doc(request.aliasId), { status: 'active' });
  });

  await batch.commit();
});

exports.onUserDeath = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    if (!previousValue.isDead && newValue.isDead) {
      const aliases = await admin.firestore().collection('aliases')
        .where('userId', '==', context.params.userId)
        .get();

      const batch = admin.firestore().batch();

      aliases.forEach(doc => {
        batch.update(doc.ref, { status: 'active' });
      });

      await batch.commit();

      // Send emails to all aliases
      const mailPromises = aliases.docs.map(doc => {
        const alias = doc.data();
        const mailOptions = {
          from: 'Your App <noreply@yourapp.com>',
          to: alias.aliasEmail,
          subject: 'Access Granted to User Credentials',
          text: `You have been granted access to the credentials of ${newValue.email}. Please log in to access them.`
        };
        return transporter.sendMail(mailOptions);
      });

      await Promise.all(mailPromises);
    }
  });
