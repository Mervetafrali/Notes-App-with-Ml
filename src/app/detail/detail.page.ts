import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { NotesService } from '../services/notes.service';
import { Note } from '../note/note';
import { FileChooser } from '@ionic-native/file-chooser/ngx';
import {HMSTextServiceProvider} from '@hmscore/ionic-native-hms-ml'
@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage {

  public note: Note;
  imageResult: string = "";
  textRecognitionOutput: string = "";
  constructor(private fileChooser: FileChooser,private route: ActivatedRoute, private notesService: NotesService, private navCtrl: NavController) { 

   this.note = {
      id: '',
      title: '',
      content: ''
    };

  }

  ngOnInit() {

    
    let noteId = this.route.snapshot.paramMap.get('id');
    
   if(this.notesService.loaded){
      this.note = this.notesService.getNote(noteId)
    } else {
      this.notesService.load().then(() => {
        this.note = this.notesService.getNote(noteId)
      });
    }

  }
  async getFile() {
    console.log("deneme");
    
  }
  noteChanged(){
    this.notesService.save();
  }

  deleteNote(){
    this.notesService.deleteNote(this.note);
    this.navCtrl.navigateBack('/notes');
  }
  async addMLNotes(){
    this.fileChooser.open()
      .then(uri => {
        this.imageResult = uri;
        this.getText();
      })
      .catch(e => console.log(e));
      
  }
  async getText(){
    var localImageTextAnalyserInput = {
      ocrType: 0,
      analyseMode: 0,
      localTextSetting: {
        ocrMode:1,
        language: "en",
      },
      filePath: this.imageResult,
    };
    try {
      const result = await HMSTextServiceProvider.imageTextAnalyser(localImageTextAnalyserInput);
      this.note.content+= JSON.stringify(result.stringValue);
      this.noteChanged()
    } catch (ex) {
      alert(JSON.stringify(ex))
    }
  }
  
    


}
