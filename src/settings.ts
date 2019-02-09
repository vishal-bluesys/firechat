import { TabsPage } from './pages/tabs/tabs';

export namespace Settings {

  export const firebaseConfig = {
    apiKey: "AIzaSyDN6WmBnJGfN64BnR-r4TW9V8N1IHgps1w",
    authDomain: "chatapp-3f829.firebaseapp.com",
    databaseURL: "https://chatapp-3f829.firebaseio.com",
    projectId: "chatapp-3f829",
    storageBucket: "chatapp-3f829.appspot.com",
    messagingSenderId: "845839389008"
  };
  
  export const facebookLoginEnabled = true;
  export const googleLoginEnabled = true;
  export const phoneLoginEnabled = true;

  export const facebookAppId: string = "767580770058358";
  export const googleClientId: string = "845839389008-s0scp3mghdi67t5ga9t56j6265ibonp5.apps.googleusercontent.com"; 
  export const customTokenUrl: string = "https://us-central1-chatapp-3f829.cloudfunctions.net/getCustomToken";
  
  export const homePage = TabsPage;
}