import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
declare var google;

@Component({
  selector: 'page-friends-filter',
  templateUrl: 'friends-filter.html',
})
export class FriendsFilterPage {
  age: any = {
    lower: 0,
    upper: 100
  }
  area: any = '';
  places: any = [];
  
  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad FriendsFilterPage');
  }

  
  search() {
    let textbox = document.getElementById('searchBox').getElementsByTagName('input')[0];
    let autocomplete = new google.maps.places.Autocomplete(textbox, { types: ['geocode'] });
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      // retrieve the place object for your use
      let place = autocomplete.getPlace();
      this.area = place.formatted_address;
      console.log(this.area);
    });
  }

  apply() {
    this.viewCtrl.dismiss({
      ageStart: this.age.lower,
      ageEnd: this.age.upper,
      location: this.area
    });
  }
  cancel() {
    this.viewCtrl.dismiss();
  }

}
