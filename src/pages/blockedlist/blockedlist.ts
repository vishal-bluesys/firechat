import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import * as firebase from 'firebase';

@IonicPage()
@Component({
  selector: 'page-blockedlist',
  templateUrl: 'blockedlist.html',
})
export class BlockedlistPage {
  blockedList: any = [];
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public dataProvider: DataProvider, public loading: LoadingProvider) {
  }

  ionViewDidLoad() {
    this.dataProvider.getBlockedLists().snapshotChanges().subscribe( conversations=> {
      let tmp = [];
      conversations.forEach( conversation => {
        // fetch blocked conversation & user info
        this.dataProvider.getUser(conversation.key).snapshotChanges().subscribe( data => { 
          tmp.push({ key: conversation.key, name: data.payload.val().name, img: data.payload.val().img });
        });
        
      })
      console.log(tmp);
      this.blockedList = tmp;
    });
  }
  close(){
    this.viewCtrl.dismiss();
  }
  unblock(uid){
    console.log(uid);
    firebase.database().ref('accounts/'+firebase.auth().currentUser.uid+'/conversations/'+uid).update({
      blocked: false
    });
  }

}
