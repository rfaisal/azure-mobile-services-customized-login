Override the Default Login to provide Customized Identities in Windows Azure Mobile Services
======================================

we want to be able to do the following:

- Add custom claims to the identity. In this example, we will add custom claims to the facebook identity.
- Add a new oAuth identity provider (in addition to the ones supported by the Windows Azure Mobile Services). In this example, we will add github as the new identity provider.
- Add a simple classical identity provider, i.e., login by username and password.
- Add support for multiple apps using the same Windows Azure Mobile Services. It is necessary, if you have a public API exposed and other people are making apps using your backend.
