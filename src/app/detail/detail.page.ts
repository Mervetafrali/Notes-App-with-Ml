import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NotesService } from '../services/notes.service';
import { Note } from '../note/note';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import { HMSTextServiceProvider, HMSMLKit } from '@hmscore/ionic-native-hms-ml';
declare var HMSVoiceServiceProvider;
@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage {
  public note: Note;
  imageResult: string = '';
  textRecognitionOutput: string = '';
  constructor(
    private fileChooser: FileChooser,
    private alertCtrl: AlertController,
    private route: ActivatedRoute,
    private notesService: NotesService,
    private navCtrl: NavController
  ) {
    this.note = {
      id: '',
      title: '',
      content: '',
    };
  }

  ngOnInit() {
    let noteId = this.route.snapshot.paramMap.get('id');
    if (this.notesService.loaded) {
      this.note = this.notesService.getNote(noteId);
    } else {
      this.notesService.load().then(() => {
        this.note = this.notesService.getNote(noteId);
      });
    }
  }

  noteChanged() {
    this.notesService.save();
  }

  deleteNote() {
    this.notesService.deleteNote(this.note);
    this.navCtrl.navigateBack('/notes');
  }
  async addMLNotes() {
    this.fileChooser
      .open()
      .then((uri) => {
        this.imageResult = uri;
        this.getText();
      })
      .catch((e) => console.log(e));
  }
  async getText() {
    var localImageTextAnalyserInput = {
      ocrType: 0,
      analyseMode: 0,
      localTextSetting: {
        ocrMode: 1,
        language: 'en',
      },
      filePath: this.imageResult,
    };
    try {
      const result = await HMSTextServiceProvider.imageTextAnalyser(
        localImageTextAnalyserInput
      );
      this.updateNote(JSON.stringify(result.stringValue));
    } catch (ex) {
      alert(JSON.stringify(ex));
    }
  }
  updateNote(text: string) {
    this.note.content += text;
    this.noteChanged();
  }
  asr() {
    this.alertCtrl
      .create({
        header: 'Click Start',
        message: 'Wait until the result returns.',
        buttons: [
          {
            text: 'Start',
            handler: () => {
              this.mlAsr();
            }
          },
        ],
      })
      .then((alert) => {
        alert.present();
      });
  }
  async mlAsr(){
    var asrAnalyserInput = {
      language: HMSVoiceServiceProvider.LANGUAGE.LAN_EN_US,
      feature: HMSVoiceServiceProvider.FEATURE.FEATURE_ALLINONE,
    };

    const promise = new Promise((resolve, reject) => {
      HMSVoiceServiceProvider.asrAnalyser(
        asrAnalyserInput,
        (res) => {
          if (res.eventName == 'onResults') {
            resolve(res.result);
            
          }
        },
        function (err: any) {
          reject(err);
        }
      );
    });
    promise.then((res) => {
      this.note.content += res;
      this.noteChanged();
      HMSVoiceServiceProvider.asrAnalyserStop();
    });
    promise.catch((err) => {
      console.log( err); 
   });
    
  }
 
  async tts() {
    var ttsReq = {
      text: this.note.content,
      mlConfigs: {
        language: HMSMLKit.MLTtsConstants.TTS_EN_US,
        person: HMSMLKit.MLTtsConstants.TTS_SPEAKER_FEMALE_EN,
        speed: 1.0,
        volume: 1.0,
      },
      queuingMode: 0,
    };
    try {
      await HMSVoiceServiceProvider.ttsAnalyser(ttsReq);
    } catch (Ex) {
      alert(JSON.stringify(Ex));
    }
  }
}
