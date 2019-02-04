import { Component, OnInit, NgZone } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { CustomService } from '../custom.service';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { DetailsPage } from '../details/details.page';
import { Storage } from "@ionic/storage";
import { ToastController, PopoverController } from '@ionic/angular';
import { tap } from "rxjs/operators";
import { Observable } from "rxjs";
import { PopComponent } from '../pop/pop.component';

@Component({
  selector: "app-home",
  templateUrl: "./home.page.html",
  styleUrls: ["./home.page.scss"]
})
export class HomePage implements OnInit {
  uid;
  count_downs;

  constructor(
    public firebase: AngularFireDatabase,
    public fireauth: AngularFireAuth,
    public custom: CustomService,
    public router: Router,
    public parse: DataService,
    public toastCtrl: ToastController,
    public popCtrl: PopoverController,
    public storage: Storage
  ) {}

  ngOnInit() {
    this.uid = this.fireauth.auth.currentUser.uid;

    try {
      this.firebase.database
        .ref(`/reminders/${this.uid}`)
        .on("value", snapshot => {
          // this.zone.run(() => {
            this.count_downs = this.custom.snapToArray(snapshot);
            this.storage.set('countdowns', this.count_downs);
          // });
        });
    } catch (e) {
      this.storage.get('countdowns').then((data) => {
        this.count_downs = data;
      });
    }
  }

  add() {
    this.router.navigateByUrl('/add');
  }

  async details(key) {
    this.parse.count_down_id = key;
    await this.router.navigate(['/details']);
  }

  logout() {
    this.fireauth.auth.signOut();
    this.storage.remove('loggedInfo');
    this.router.navigateByUrl('/login');
    this.custom.toast("Successfully Logged Out!", "top");
  }

	delete(key) {
		this.firebase.database.ref(`/reminders/${this.uid}/${key}`).remove();
  }

  async pop2(p) {
    return await p.present();
  }
  
  pop(pop_event) {
    const popover = this.popCtrl
      .create({
        component: PopComponent,
        mode: 'ios',
        event: pop_event
      })
      .then(output => {
        this.pop2(output);
      });
  }
}
