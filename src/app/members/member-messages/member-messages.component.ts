import { Component, OnInit, Input } from '@angular/core';
import { Message } from 'src/app/_models/Message';
import { UserService } from 'src/app/_services/user.service';
import { AlertifyService } from 'src/app/_services/alertify.service';
import { AuthService } from 'src/app/_services/auth.service';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-member-messages',
  templateUrl: './member-messages.component.html',
  styleUrls: ['./member-messages.component.css']
})
export class MemberMessagesComponent implements OnInit {
  @Input() recepientId: number;
  messages: Message[];
  newMessage: any = {};

  constructor(private userService: UserService, private alertify: AlertifyService, private authService: AuthService) { }

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    const currentUserId = +this.authService.decodedToken.nameid;  //we added + to force it to be a type number and den use it in the tap loop method below

    this.userService.getMessageThread(this.authService.decodedToken.nameid, this.recepientId)
    .pipe(
      tap( messages => {
        for(let i = 0; i < messages.length; i++) {
          if(messages[i].isRead === false && messages[i].recepientId === currentUserId) {
            this.userService.markAsRead(currentUserId, messages[i].id);
          }
        }
      })
    ).subscribe(messages => {
      this.messages = messages;
    }, error => {
      this.alertify.error(error);
    });
  }

  sendMessage() {
    this.newMessage.recepientId = this.recepientId;
    this.userService.sendMessage(this.authService.decodedToken.nameid, this.newMessage).subscribe((message: Message) => {
      this.messages.unshift(message);
      this.newMessage.content = '';
    }, error => {
      this.alertify.error(error);
    }); 
  }
}
