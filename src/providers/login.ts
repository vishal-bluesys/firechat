import { Injectable, NgZone } from '@angular/core';
import { Settings } from '../settings';
import { NavController, Platform, ToastController, AlertController } from 'ionic-angular';
import { LoadingProvider } from './loading';
import { AlertProvider } from './alert';
import { Http } from '@angular/http';

import * as firebase from 'firebase';
import { AngularFireAuth } from 'angularfire2/auth';

import { GooglePlus } from '@ionic-native/google-plus';
import { Facebook } from '@ionic-native/facebook';

@Injectable()
export class LoginProvider {

  private navCtrl: NavController;
  constructor(public loadingProvider: LoadingProvider, public alertProvider: AlertProvider, public zone: NgZone, public googleplus: GooglePlus,
    public platform: Platform, public afAuth: AngularFireAuth, public http: Http, public toastCtrl: ToastController, public facebook: Facebook, public alert: AlertController) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.zone.run(() => {
          this.navCtrl.setRoot(Settings.homePage, { animate: false });
        });
      }
    });
  }

  setNavController(navCtrl) {
    this.navCtrl = navCtrl;
  }

  facebookLogin() {

    if(this.platform.is('core')){
      // let fbCredential;
      this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider()).then(fbRes=>{
        console.log(fbRes);
        
        let fbcredential = firebase.auth.FacebookAuthProvider.credential(fbRes.credential.accessToken);
        console.log(fbcredential);
        this.loadingProvider.show();
        firebase.auth().signInWithCredential(fbcredential).then((success) => {
          
          let data = fbRes.additionalUserInfo.profile;
          let uid = firebase.auth().currentUser.uid;
          console.log(uid);
          if(fbRes.additionalUserInfo.isNewUser == true)
            this.createNewUser(uid,data.first_name,uid,data.email,'I am available','Facebook',data.picture.data.url, data.gender);

          this.loadingProvider.hide();
        })
        .catch((error) => {
          console.log(error);
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage(error["code"]);
        });
      }).catch( error=>{
        console.log(error);
      });
    } else{
      this.facebook.login(['public_profile', 'email']).then( res => {
        console.log(res);
        let credential = firebase.auth.FacebookAuthProvider.credential(res.authResponse.accessToken);
        this.loadingProvider.show();
        firebase.auth().signInWithCredential(credential)
        .then((success) => {
          console.log(success);
          this.facebook.api("me/?fields=id,email,first_name,picture,gender",["public_profile","email"])
          .then( data => {
            console.log(data)
            let uid = firebase.auth().currentUser.uid;
            this.createNewUser(uid,data.first_name,uid,data.email,'I am available','Facebook',data.picture.data.url,data.gender);
          })
          .catch( err => {
            console.log(err);
            this.loadingProvider.hide();
          })
          
        })
        .catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage(error["code"]);
        });
        
      }).catch( err=> console.log(err));
    }
  }

  googleLogin() {
    if(this.platform.is('core')){
      this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then(gpRes =>{
        console.log(gpRes);
        let credential = firebase.auth.GoogleAuthProvider.credential(gpRes.credential.idToken,gpRes.credential.accessToken);
        firebase.auth().signInWithCredential(credential)
          .then((success) => {
            console.log(success);
            let uid = firebase.auth().currentUser.uid;
            let data = gpRes.additionalUserInfo.profile;
            if(gpRes.additionalUserInfo.isNewUser == true)
              this.createNewUser(uid,data.name,uid,data.email,'I am available','Google',data.picture, data.gender);
            this.loadingProvider.hide();
          })
          .catch((error) => {
            this.loadingProvider.hide();
            this.alertProvider.showErrorMessage(error["code"]);
          });
      }).catch( err=>{
        console.log(err)
      });
    }
    else{
      this.loadingProvider.show();
      this.googleplus.login({
        'webClientId': Settings.googleClientId
      }).then((success) => {
        console.log(success);
        let credential = firebase.auth.GoogleAuthProvider.credential(success['idToken'], null);
        firebase.auth().signInWithCredential(credential)
          .then((data) => {
            console.log(data);
            this.loadingProvider.hide();
            let uid = firebase.auth().currentUser.uid;
            this.createNewUser(uid,data.displayName,uid, data.email,'I am available','Google',data.imageUrl);
          })
          .catch((error) => {
            this.loadingProvider.hide();
            this.alertProvider.showErrorMessage(error["code"]);
          });
      }, error => { 
        console.log(error);
        this.loadingProvider.hide();
      });
    }
  }


  // Login on Firebase given the email and password.
  emailLogin(email, password) {
    this.loadingProvider.show();
    firebase.auth().signInWithEmailAndPassword(email, password).then((success) => {
        this.loadingProvider.hide();
    }).catch((error) => {
        this.loadingProvider.hide();
        this.alertProvider.showErrorMessage(error["code"]);
    });
  }

  phoneLogin(){
    if(this.platform.is('core'))
      this.toastCtrl.create({message: 'AccountKit only works on device', duration: 3000}).present();
    else{
      (<any>window).AccountKitPlugin.loginWithPhoneNumber({
        useAccessToken: true,
        defaultCountryCode: "IN",
        facebookNotificationsEnabled: true,
      }, data => {

      (<any>window).AccountKitPlugin.getAccount(
        info => { // getting user info
          let phoneNumber = info.phoneNumber;
          this.http.get(Settings.customTokenUrl+"?access_token="+info.token).subscribe( data=>{
            let token = data['_body'];
            this.loadingProvider.show();
            firebase.auth().signInWithCustomToken(token).then( data=>{
              let uid = firebase.auth().currentUser.uid;
              this.createNewUser(uid,phoneNumber,uid,null,'I am available','Phone','./assets/images/default-dp.png')
              this.loadingProvider.hide();
            }).catch( err=> {
              this.loadingProvider.hide();
              console.log(err)
            });
                    
          }, err=>{
            console.log(err);
          });
        },
        err =>  console.log(err) );
      });
    }
  }
  // Register user on Firebase given the email and password.
  register(name, username, email, password,img) {
    this.loadingProvider.show();
    firebase.auth().createUserWithEmailAndPassword(email, password).then((success) => {
        let user=firebase.auth().currentUser;
        this.createNewUser(user.uid, name , username,user.email,"I am available","Firebase",img);
        this.loadingProvider.hide();
      }).catch((error) => {
        this.loadingProvider.hide();
        this.alertProvider.showErrorMessage(error["code"]);
      });
  }

  // Send Password Reset Email to the user.
  sendPasswordReset(email) {
    console.log(email);
    if(email != null || email != undefined || email != ""){
      this.loadingProvider.show();
      firebase.auth().sendPasswordResetEmail(email).then((success) => {
          this.loadingProvider.hide();
          this.alertProvider.showPasswordResetMessage(email);
        }).catch((error) => {
          this.loadingProvider.hide();
          this.alertProvider.showErrorMessage(error["code"]);
        });
    }
  }

  // Creating new user after signed up
  createNewUser(userId,name,username,email,description = "I'm available",provider,img="./assets/images/default-dp.png", gender='none'){
    let dateCreated= new Date();
    firebase.database().ref('accounts/'+userId).update({dateCreated,username,name,userId,email,description,provider,img, gender});
  }

}
