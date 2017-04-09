import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { EpisodiosService } from '../../providers/episodios-service';
//import { Dialogs } from 'ionic-native';

/*
  Generated class for the Chat page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
  providers: [EpisodiosService]
})
export class ChatPage {
    episodio: string;
    items: Array<any>;
    timer:any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private episodiosService: EpisodiosService) {
    this.episodio = this.navParams.get('episodioMsg');
    this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                this.items=data.response.items;
            },
            err => {
                alert(err);
            }
        );       
  }
  
      ngOnDestroy(){
        clearInterval(this.timer);
    }


  ionViewDidLoad() {
    console.log('ionViewDidLoad ChatPage');
    this.timer = setInterval(() =>{
        console.log("[CHAT] Actualizando Chat");
        this.episodiosService.dameChatEpisodio(this.episodio).subscribe(
            data => {
                if (this.items == null){
                    this.items=data.response.items;
                }
                else {
                    let longArray = data.response.items.length;
                    let i:number=0;
                    //console.log("[CHAT] LA nueva remesa de mensajes tiene de longitud " + longArray  ); 
                    while (data.response.items[i].message_id != this.items[0].message_id && (i+1) < longArray) {
                        i++;
                        console.log("[CHAT] " + i );   
                    }
                    this.items = data.response.items.slice(0,i).concat(this.items);
                    console.log("[CHAT] Se han encontrado " + i + " nuevos mensajes");
                }
            },
            err => {
                //Dialogs.alert('Error actualizando chat', 'Oh oh...');
                console.log ("[CHAT] Error actualizando chat: " + err)
            }
        );       
    }, 5000);
  }
/*
  concatenaChat (arrayChat, nuevoArray){
    if (arrayChat[0].message_id == nuevoArray[0].message_id){
        return arrayChat;
    }
    else{
        return nuevoArray[0].concat(this.concatenaChat(arrayChat, nuevoArray.slice(1)));
    }
  }
  */
  
  quieroMas(event){
      this.episodiosService.dameMasComentarios(this.episodio, this.items[this.items.length-1].message_id).subscribe(
            data => {
                this.items=this.items.concat(data.response.items);
                //console.log("[HOME] Recibidos "+data.response.items.length+" nuevos elementos. Ahora la lista tiene "+ this.items.length + " elementos");
                event.complete();
            },
            err => {
                event.complete();
                console.log(err);
            }
        );
    }



}
