import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, App, Platform, ToastController, ModalController } from 'ionic-angular';
import { LogoutProvider } from '../../providers/logout';
import { LoadingProvider } from '../../providers/loading';
import { AlertProvider } from '../../providers/alert';
import { ImageProvider } from '../../providers/image';
import { DataProvider } from '../../providers/data';
import { AngularFireDatabase } from 'angularfire2/database';
import { Validator } from '../../validator';
import * as firebase from 'firebase';
import { Camera } from '@ionic-native/camera';
import { Firebase } from '@ionic-native/firebase';
import { Http } from "@angular/http";

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user: any = {
    gender: 'male',
    dob: new Date(),
    location: '',
    publicVisibility: true,
  };
  private alert;
  showOnline: any = false;
  isPushEnabled: any = false;
  isBrowser: any = false;
  places: any = [];

  // HomePage
  // This is the page where the user is directed after successful login and email is confirmed.
  // A couple of profile management function is available for the user in this page such as:
  // Change name, profile pic, email, and password
  // The user can also opt for the deletion of their account, and finally logout.
  constructor(public navCtrl: NavController, public alertCtrl: AlertController, public navParams: NavParams, public app: App,
    public logoutProvider: LogoutProvider, public loadingProvider: LoadingProvider, public imageProvider: ImageProvider,
    public angularfire: AngularFireDatabase, public alertProvider: AlertProvider, public dataProvider: DataProvider,
    public camera: Camera, public platform: Platform, public fcm: Firebase, public toast: ToastController, public modal: ModalController, public http: Http) {
    this.logoutProvider.setApp(this.app);
    if (this.platform.is('core')) this.isBrowser = true;

    if (localStorage.getItem('isPushEnabled') == 'true') this.isPushEnabled = true;
    else this.isPushEnabled = false;

    if (localStorage.getItem('showOnline') == 'true') this.showOnline = true;
    else this.showOnline = false;



  }

  ionViewDidLoad() {
    // Observe the userData on database to be used by our markup html.
    // Whenever the userData on the database is updated, it will automatically reflect on our user variable.
    this.loadingProvider.show();
    this.dataProvider.getCurrentUser().snapshotChanges().subscribe((user) => {
      this.loadingProvider.hide();
      this.user = user.payload.val();
      console.log(this.user);
    });
  }

  search() {
    console.log(this.user.location);
    let textbox = document.getElementById('txtHome').getElementsByTagName('input')[0];
    let autocomplete = new google.maps.places.Autocomplete(textbox, { types: ['geocode'] });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      // retrieve the place object for your use
      let place = autocomplete.getPlace();
      this.user.location = place.formatted_address;
      console.log(this.user.location);
    });
  }
  changeStatus() {
    console.log(this.showOnline);
    localStorage.setItem('showOnline', this.showOnline);
    this.angularfire.object('accounts/' + this.user.userId).update({
      online: this.showOnline
    });
  }
  changeVisibility() {
    this.angularfire.object('accounts/' + this.user.userId).update({
      publicVisibility: this.user.publicVisibility
    });
  }

  save() {

    let dob = (this.user.dob).split("-");
    console.log(dob);
    let currentYear: any = new Date().getFullYear();
    this.user.age = parseInt(currentYear) - dob[0];
    this.angularfire.object('accounts/' + this.user.userId).update(this.user).then(() => this.toast.create({ message: 'Updated Successfully', duration: 2000 }).present());
  }

  showBlockedList() {
    this.modal.create("BlockedlistPage").present();
  }
  changeNotification() {

    console.log(this.isPushEnabled);
    if (this.isPushEnabled == true) {
      //Registering for push notification
      this.fcm.hasPermission().then(data => {
        if (data.isEnabled != true) {
          this.fcm.grantPermission().then(data => {
            console.log(data);
          });
        }
        else {
          this.fcm.getToken().then(token => {
            console.log(token);
            this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid).update({ pushToken: token });
            localStorage.setItem('isPushEnabled', 'true');
            this.isPushEnabled = true;
          }).catch(err => {
            console.log(err);
          });
          this.fcm.onTokenRefresh().subscribe(token => {
            console.log(token);
            this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid).update({ pushToken: token });
          });
        }
      });
      this.fcm.onNotificationOpen().subscribe(data => {
        console.log(data);
      });
    }
    else {
      this.isPushEnabled == false;
      this.angularfire.object('/accounts/' + firebase.auth().currentUser.uid).update({ pushToken: '' });
      localStorage.setItem('isPushEnabled', 'false');
    }
  }
  // Change user's profile photo. Uses imageProvider to process image and upload on Firebase and update userData.
  setPhoto() {
    // Ask if the user wants to take a photo or choose from photo gallery.
    this.alert = this.alertCtrl.create({
      title: 'Set Profile Photo',
      message: 'Do you want to take a photo or choose from your photo gallery?',
      buttons: [
        {
          text: 'Cancel',
          handler: data => { }
        },
        {
          text: 'Choose from Gallery',
          handler: () => {
            // Call imageProvider to process, upload, and update user photo.
            this.imageProvider.setProfilePhoto(this.user, this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Take Photo',
          handler: () => {
            // Call imageProvider to process, upload, and update user photo.
            this.imageProvider.setProfilePhoto(this.user, this.camera.PictureSourceType.CAMERA);
          }
        }
      ]
    }).present();
  }


  // Change user's password, this option only shows up for users registered via Firebase.
  // The currentPassword is first checked, after which the new password should be entered twice.
  // Uses password validator from Validator.ts.
  setPassword() {
    this.alert = this.alertCtrl.create({
      title: 'Change Password',
      message: "Please enter a new password.",
      inputs: [
        {
          name: 'currentPassword',
          placeholder: 'Current Password',
          type: 'password'
        },
        {
          name: 'password',
          placeholder: 'New Password',
          type: 'password'
        },
        {
          name: 'confirmPassword',
          placeholder: 'Confirm Password',
          type: 'password'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => { }
        },
        {
          text: 'Save',
          handler: data => {
            let currentPassword = data["currentPassword"];
            let credential = firebase.auth.EmailAuthProvider.credential(this.user.email, currentPassword);
            // Check if currentPassword entered is correct
            this.loadingProvider.show();
            firebase.auth().currentUser.reauthenticateWithCredential(credential)
              .then((success) => {
                let password = data["password"];
                // Check if entered password is not the same as the currentPassword
                if (password != currentPassword) {
                  if (password.length >= Validator.profilePasswordValidator.minLength) {
                    if (Validator.profilePasswordValidator.pattern.test(password)) {
                      if (password == data["confirmPassword"]) {
                        // Update password on Firebase.
                        firebase.auth().currentUser.updatePassword(password)
                          .then((success) => {
                            this.loadingProvider.hide();
                            Validator.profilePasswordValidator.pattern.test(password);
                            this.alertProvider.showPasswordChangedMessage();
                          })
                          .catch((error) => {
                            this.loadingProvider.hide();
                            let code = error["code"];
                            this.alertProvider.showErrorMessage(code);
                            if (code == 'auth/requires-recent-login') {
                              this.logoutProvider.logout();
                            }
                          });
                      } else {
                        this.alertProvider.showErrorMessage('profile/passwords-do-not-match');
                      }
                    } else {
                      this.alertProvider.showErrorMessage('profile/invalid-chars-password');
                    }
                  } else {
                    this.alertProvider.showErrorMessage('profile/password-too-short');
                  }
                }
              })
              .catch((error) => {
                //Show error
                this.loadingProvider.hide();
                let code = error["code"];
                this.alertProvider.showErrorMessage(code);
              });
          }
        }
      ]
    }).present();
  }

  // Delete the user account. After deleting the Firebase user, the userData along with their profile pic uploaded on the storage will be deleted as well.
  // If you added some other info or traces for the account, make sure to account for them when deleting the account.
  deleteAccount() {
    this.alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete your account? This cannot be undone.',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Delete',
          handler: data => {
            this.loadingProvider.show();
            // Delete Firebase user
            firebase.auth().currentUser.delete()
              .then((success) => {
                // Delete profilePic of user on Firebase storage
                this.imageProvider.deleteUserImageFile(this.user);
                // Delete user data on Database
                this.angularfire.object('/accounts/' + this.user.userId).remove().then(() => {
                  this.loadingProvider.hide();
                  this.alertProvider.showAccountDeletedMessage();
                  this.logoutProvider.logout();
                });
              })
              .catch((error) => {
                this.loadingProvider.hide();
                let code = error["code"];
                this.alertProvider.showErrorMessage(code);
                if (code == 'auth/requires-recent-login') {
                  this.logoutProvider.logout();
                }
              });
          }
        }
      ]
    }).present();
  }

  // Log the user out.
  logout() {
    this.alert = this.alertCtrl.create({
      title: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Logout',
          handler: data => { this.logoutProvider.logout(); }
        }
      ]
    }).present();
  }
}
