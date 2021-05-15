import { Component } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { NotesService } from '../services/notes.service';
import { Platform } from "@ionic/angular";
declare var HMSMLKit;
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(public platform: Platform,public notesService: NotesService,private alertCtrl: AlertController, private navCtrl: NavController){
  }
  ionViewWillEnter() {
    this.platform.ready().then(() => {
      var configInput = {
        apiKey: "CgB6e3x9ENSvJ4wbkFp48Tr2epfTKMHBxCD0OwdQlwhFKrlY9yDVm9AaSxaHFTCAKw7h1Mo38Gfxrsli5ms0wiK9",
      };
      HMSMLKit.serviceInitializer(configInput);
    });
    
  }
  ngOnInit(){
    this.permissions();
    this.notesService.load();
  }
  
  addNote(){

    this.alertCtrl.create({
      header: 'New Note',
      inputs: [
        {
          type: 'text',
          name: 'title',
          placeholder:'Title'
        }
      ],
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Save',
          handler: (data) => {
            this.notesService.createNote(data.title);
          }
        }
      ]
    }).then((alert) => {
      alert.present();
    });

  }
  public async permissions(){
    try {
      await HMSMLKit.requestPermissions({
        permissionList: ["camera", "readExternalStorage", "audio", "writeExternalStorage"],
      });
    } catch (ex) {
      console.log(JSON.stringify(ex));
    }
  }
}
