import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Content, AlertController, ModalController, ActionSheetController } from 'ionic-angular';
import { DataProvider } from '../../providers/data';
import { LoadingProvider } from '../../providers/loading';
import { ImageProvider } from '../../providers/image';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import { ImageModalPage } from '../image-modal/image-modal';

import { Camera } from '@ionic-native/camera';
import { Contacts } from '@ionic-native/contacts';
import { Keyboard } from '@ionic-native/keyboard';
import { Geolocation } from '@ionic-native/geolocation';
import { UserInfoPage } from '../user-info/user-info';


@Component({
  selector: 'page-message',
  templateUrl: 'message.html'
})
export class MessagePage {
  @ViewChild(Content) content: Content;
  private userId: any;
  private title: any;
  private message: any;
  private conversationId: any;
  private messages: any;
  private updateDateTime: any;
  private messagesToShow: any;
  private startIndex: any = -1;
  // Set number of messages to show.
  private numberOfMessages = 10;
  private loggedInUserId: any;

  // MessagePage
  // This is the page where the user can chat with a friend.
  constructor(public navCtrl: NavController, public navParams: NavParams, public dataProvider: DataProvider, public angularfire: AngularFireDatabase,
    public loadingProvider: LoadingProvider, public alertCtrl: AlertController, public imageProvider: ImageProvider, public modalCtrl: ModalController,
    public camera: Camera, public keyboard: Keyboard, public actionSheet: ActionSheetController, public contacts: Contacts, public geolocation: Geolocation){ }
  ionViewDidLoad() {
    
    this.userId = this.navParams.get('userId');
    this.loggedInUserId = firebase.auth().currentUser.uid;
    console.log(this.userId);
    
    // Get friend details.
    this.dataProvider.getUser(this.userId).snapshotChanges().subscribe((user) => {
      this.title = user.payload.val().name;
    });

    // Get conversationInfo with friend.
    this.angularfire.object('/accounts/' + this.loggedInUserId + '/conversations/' + this.userId).snapshotChanges().subscribe((conversation) => {
      if (conversation.payload.exists()) {
        // User already have conversation with this friend, get conversation
        this.conversationId = conversation.payload.val().conversationId;

        // Get conversation
        this.dataProvider.getConversationMessages(this.conversationId).snapshotChanges().subscribe((messagesRes) => {
         
          let messages = messagesRes.payload.val();
          console.log(messages);
          if(messages == null)
            messages = [];
          if (this.messages) {
            // Just append newly added messages to the bottom of the view.
            if (messages.length > this.messages.length) {
              let message = messages[messages.length - 1];

              this.dataProvider.getUser(message.sender).snapshotChanges().subscribe((user) => {
                message.avatar = user.payload.val().img;
              });
              this.messages.push(message);
              this.messagesToShow.push(message);
            }
          } else {
            // Get all messages, this will be used as reference object for messagesToShow.
            this.messages = [];
            messages.forEach((message) => {
              this.dataProvider.getUser(message.sender).snapshotChanges().subscribe((user) => {
                message.avatar = user.payload.val().img;
              });
              this.messages.push(message);
            });
            // Load messages in relation to numOfMessages.
            if (this.startIndex == -1) {
              // Get initial index for numberOfMessages to show.
              if ((this.messages.length - this.numberOfMessages) > 0) {
                this.startIndex = this.messages.length - this.numberOfMessages;
              } else {
                this.startIndex = 0;
              }
            }
            if (!this.messagesToShow) {
              this.messagesToShow = [];
            }
            // Set messagesToShow
            for (var i = this.startIndex; i < this.messages.length; i++) {
              this.messagesToShow.push(this.messages[i]);
            }
            this.loadingProvider.hide();
          }
        });
      }
    });

    // Update messages' date time elapsed every minute based on Moment.js.
    var that = this;
    if (!that.updateDateTime) {
      that.updateDateTime = setInterval(function() {
        if (that.messages) {
          that.messages.forEach((message) => {
            let date = message.date;
            message.date = new Date(date);
          });
        }
      }, 60000);
    }
  }
  ionViewDidEnter(){
    this.scrollBottom();
  }
  // Load previous messages in relation to numberOfMessages.
  loadPreviousMessages() {
    var that = this;
    // Show loading.
    this.loadingProvider.show();
    setTimeout(function() {
      // Set startIndex to load more messages.
      if ((that.startIndex - that.numberOfMessages) > -1) {
        that.startIndex -= that.numberOfMessages;
      } else {
        that.startIndex = 0;
      }
      // Refresh our messages list.
      that.messages = null;
      that.messagesToShow = null;
      
      that.scrollTop();

      // Populate list again.
      that.ionViewDidLoad();
    }, 1000);
  }

  // Update messagesRead when user lefts this page.
  ionViewWillLeave() {
    this.setMessagesRead();
  }

  // Check if currentPage is active, then update user's messagesRead.
  setMessagesRead() {
    firebase.database().ref('/conversations/' + this.conversationId + '/messages').once('value', snap =>{
      console.log(snap.val());
      if(snap.val() != null){
        this.angularfire.object('/accounts/' + this.loggedInUserId + '/conversations/' + this.userId).update({
          messagesRead: snap.val().length
        });
      }
    });
  }

  // Scroll to bottom of page after a short delay.
  scrollBottom() {
    
    var that = this;
    setTimeout(function() {
      that.content.scrollToBottom();
    }, 300);
    this.setMessagesRead();
  }

  // Scroll to top of the page after a short delay.
  scrollTop() {
    var that = this;
    setTimeout(function() {
      that.content.scrollToTop();
    }, 300);
  }


  // Check if the user is the sender of the message.
  isSender(message) {
    if (message.sender == this.loggedInUserId) {
      return true;
    } else {
      return false;
    }
  }


  // Send message, if there's no conversation yet, create a new conversation.
  send(type) {
    if (this.message) {
      // User entered a text on messagebox
      if (this.conversationId) {
        let messages = JSON.parse(JSON.stringify(this.messages));
        messages.push({
          date: new Date().toString(),
          sender: this.loggedInUserId,
          type: type,
          message: this.message
        });

        // Update conversation on database.
        this.dataProvider.getConversation(this.conversationId).update({
          messages: messages
        });
        // Clear messagebox.
        this.message = '';
        this.scrollBottom();
      } else {
        console.log("else")
        // New Conversation with friend.
        var messages = [];
        messages.push({
          date: new Date().toString(),
          sender: this.loggedInUserId,
          type: type,
          message: this.message
        });
        var users = [];
        users.push(this.loggedInUserId);
        users.push(this.userId);
        // Add conversation.
        this.angularfire.list('conversations').push({
          dateCreated: new Date().toString(),
          messages: messages,
          users: users
        }).then((success) => {
          let conversationId = success.key;
          this.message = '';
          // Add conversation reference to the users.
          this.angularfire.object('/accounts/' + this.loggedInUserId + '/conversations/' + this.userId).update({
            conversationId: conversationId,
            messagesRead: 1
          });
          this.angularfire.object('/accounts/' + this.userId + '/conversations/' + this.loggedInUserId).update({
            conversationId: conversationId,
            messagesRead: 0
          });
        });
        this.scrollBottom();
      }
    }
  }

  viewUser(userId) {
    this.navCtrl.push(UserInfoPage, { userId: userId });
  }


  attach(){
    let action = this.actionSheet.create({
      title:'Choose attachments',
      buttons:[{
        text: 'Camera',
        handler: () =>{
          this.imageProvider.uploadPhotoMessage(this.conversationId, this.camera.PictureSourceType.CAMERA).then((url) => {
            this.message = url;
            this.send("image");
          });
        }
      },{
        text: 'Photo Library',
        handler: ()=>{
          this.imageProvider.uploadPhotoMessage(this.conversationId, this.camera.PictureSourceType.PHOTOLIBRARY).then((url) => {
            this.message = url;
            this.send("image");
          });
        }
      },
      {
        text: 'Video',
        handler: () =>{
          this.imageProvider.uploadVideoMessage(this.conversationId).then(url=>{
            this.message = url;
            this.send("video");
          });
        }
      }
      ,{
        text: 'Location',
        handler:()=>{
          this.geolocation.getCurrentPosition({
            timeout: 5000
          }).then(res => {
            let locationMessage = "Location:<br> lat:"+res.coords.latitude+"<br> lng:"+res.coords.longitude;
            let mapUrl="<a href='https://www.google.com/maps/search/"+res.coords.latitude+","+res.coords.longitude+"'>View on Map</a>";

            let confirm = this.alertCtrl.create({
              title: 'Your Location',
              message: locationMessage,
              buttons:[{
                text:'cancel',
                handler: () =>{
                  console.log("canceled");
                }
              },{
                text: 'Share',
                handler: () =>{
                  this.message = locationMessage+"<br>"+mapUrl;
                  this.send("location");
                }
              }]
            });
            confirm.present();
          }, locationErr => {
            console.log("Location Error"+ JSON.stringify(locationErr));
          });
        }
      },{
        text: 'Contact',
        handler: () =>{
          this.contacts.pickContact().then( data =>{
            let name;
            if(data.displayName !== null) name = data.displayName;
            else name = data.name.givenName +" "+data.name.familyName;
            this.message = "<b>Name:</b> "+name+"<br><b>Mobile:</b> <a href='tel:"+data.phoneNumbers[0].value+"'>"+data.phoneNumbers[0].value+"</a>";
            this.send("contact");
          }, err=>{
            console.log(err);
          })
        }
      },{
        text: 'cancel',
        role: 'cancel',
        handler: ()=>{
          console.log("cancelled");
        }
      }]
    });
    action.present();
  }

  // Enlarge image messages.
  enlargeImage(img) {
    let imageModal = this.modalCtrl.create(ImageModalPage, { img: img });
    imageModal.present();
  }
}
