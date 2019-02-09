import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { LoginPage } from '../pages/login/login';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { MessagesPage } from '../pages/messages/messages';
import { GroupsPage } from '../pages/groups/groups';
import { FriendsPage } from '../pages/friends/friends';
import { MessagePage } from '../pages/message/message';
import { GroupPage } from '../pages/group/group';
import { GroupInfoPage } from '../pages/group-info/group-info';
import { NewGroupPage } from '../pages/new-group/new-group';
import { AddMembersPage } from '../pages/add-members/add-members';
import { UserInfoPage } from '../pages/user-info/user-info';

import { LoginProvider } from '../providers/login';
import { LogoutProvider } from '../providers/logout';
import { LoadingProvider } from '../providers/loading';
import { AlertProvider } from '../providers/alert';
import { ImageProvider } from '../providers/image';
import { DataProvider } from '../providers/data';
import { FirebaseProvider } from '../providers/firebase';

import * as firebase from 'firebase';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { Settings } from '../settings';

import { FriendPipe } from '../pipes/friend';
import { SearchPipe } from '../pipes/search';
import { ConversationPipe } from '../pipes/conversation';
import { DateFormatPipe } from '../pipes/date';
import { GroupPipe } from '../pipes/group';

import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { GooglePlus } from '@ionic-native/google-plus';
import { Camera } from '@ionic-native/camera';
import { Keyboard } from '@ionic-native/keyboard';
import { Contacts } from '@ionic-native/contacts';
import { MediaCapture } from '@ionic-native/media-capture';
import { File } from '@ionic-native/file';
import { Geolocation } from '@ionic-native/geolocation';
import { Firebase } from '@ionic-native/firebase';
import { Facebook } from '@ionic-native/facebook';

import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FriendsFilterPage } from '../pages/friends-filter/friends-filter';




firebase.initializeApp(Settings.firebaseConfig);

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    HomePage,
    TabsPage,
    MessagesPage,
    GroupsPage,
    GroupInfoPage,
    FriendsPage,
    MessagePage,
    GroupPage,
    NewGroupPage,
    AddMembersPage,
    UserInfoPage,
    FriendsFilterPage,
    FriendPipe,
    ConversationPipe,
    SearchPipe,
    DateFormatPipe,
    GroupPipe
  ],
  imports: [
    IonicModule.forRoot(MyApp, {
      scrollAssist: false,
      autoFocusAssist: false,
      mode: 'ios',
      tabsPlacement: 'top'
    }),
    BrowserModule,
    AngularFireModule.initializeApp(Settings.firebaseConfig,'ionic3chat'),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    TabsPage,
    MessagesPage,
    GroupsPage,
    FriendsPage,
    MessagePage,
    GroupPage,
    GroupInfoPage,
    NewGroupPage,
    AddMembersPage,
    UserInfoPage,
    FriendsFilterPage
  ],
  providers: [{ provide: ErrorHandler, useClass: IonicErrorHandler },
    SplashScreen,
    StatusBar,
    GooglePlus,
    Camera,
    Keyboard,
    Contacts,
    MediaCapture,
    File,
    Geolocation,
    Firebase,
    Facebook,
    LoginProvider,
    LogoutProvider,
    LoadingProvider,
    AlertProvider,
    ImageProvider,
    DataProvider,
    FirebaseProvider]
})
export class AppModule { }
