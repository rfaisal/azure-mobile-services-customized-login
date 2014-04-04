## Customized Identities in Windows Azure Mobile Services


The following customizations are implemented:

- Add custom claims to the identity (the ability to provide authorization after authentication). In this example, we will add custom claims to the facebook identity.
- Add a new oAuth identity provider (in addition to the ones supported by the Windows Azure Mobile Services). In this example, we will add Foursquare as the new identity provider.
- Add a simple classical identity provider (login by username and password).
- Add support for multiple apps using the same backend. It is necessary, if you have a public API exposed and other people are making apps using your backend.
