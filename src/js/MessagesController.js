import { ajax } from 'rxjs/ajax';
import { catchError, interval, mergeMap, of } from 'rxjs';

export default class MessagesController {
    constructor() {
        this.url = 'http://localhost:7070/messages/unread';
        this.messages = document.querySelector('.messages');
        this.messages.addEventListener('click', MessagesController.onMessageClick);
    }

    init() {
        this.subscribeToUpdate();
    }

    static onMessageClick(evt) {
        console.log(evt.target);
        if (evt.target.classList.contains('message_text_col') 
            || evt.target.classList.contains('message_body')
            || evt.target.classList.contains('shortText')
            || evt.target.classList.contains('dots')
            || evt.target.classList.contains('addText')) 
        {
            evt.target.closest('.message').querySelector('.message_body').classList.toggle('visible');
            evt.target.closest('.message').querySelector('.dots').classList.toggle('visible');
            evt.target.closest('.message').querySelector('.addText').classList.toggle('visible');
        }
    }

    subscribeToUpdate() {
        this.stream$ = interval(5000)
            .pipe(
                mergeMap(() => ajax.getJSON(this.url)
                    .pipe (
                        catchError(() => of({messages: []}))
                    )
                )
            )
        .subscribe(response => response.messages.forEach(message => {
            this.messages.insertAdjacentHTML(
                'afterbegin', this.messageMarking(
                    message.id, 
                    message.from, 
                    MessagesController.msgTextLengthReg(message.subject)[0], 
                    MessagesController.msgTextLengthReg(message.subject)[1], 
                    message.body, 
                    message.recieved
                )
            );
        }))
    }

    static msgTextLengthReg(text) {
        // return text.length > 15 ? text.slice(0, 15) + '...' : text;
        const shortTxt = text.slice(0, 15);
        const addTxt = text.slice(15, text.length);
        return [shortTxt, addTxt];
    }

    messageMarking(id, email, shortText, addText, body, date) {
        return `<div class="message" id=${id}>
                    <div class="message_col">${email}</div>
                    <div class="message_col message_text_col">
                        <span class="shortText">${shortText}</span><span class="dots">...</span><span class="addText visible">${addText}</span>
                        <p class="message_body visible">${body}</p>
                    </div>
                    <div class="message_col">${date}</div>
                </div>`
    }

}