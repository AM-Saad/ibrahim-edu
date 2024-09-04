/*jslint browser: true*/
/*global console, alert, $, jQuery*/

(function () {
    const chat = {
        jwt: localStorage.getItem('token'),
        companyId: localStorage.getItem('companyId'),
        messages: [],
        newMessage: '',
        onlineusers: [],
        typing: false,

        socket: io("/chat"),
        init: function () {
            this.bindEvents()
            this.ready = true;
            this.socket.emit("register");

            this.socket.on("typing", () => {
                console.log('typing');

                $('#typing').removeClass('none')
            });
            this.socket.on("stopTyping", () => {
                $('#typing').addClass('none')
            });
            this.socket.on("newMessage", data => {
                console.log(data);
                this.renderNewMsg({ message: data.msg, user: data.user, type: 1 })
            });
            this.socket.on("online", data => {
                console.log(data);
                this.onlineusers = data
            });
            this.socket.on("offline", data => {
                // this.info.push({ name: data, type: "offline" });
            });
            window.onbeforeunload = () => {
                this.socket.emit("offline", this.name);
            };
        },
        bindEvents: function () {
            $('#send-group-msg-from').on('submit', this.sendMessage.bind(this))
            $('#group-msg').on('keyup', this.getMsg.bind(this))
            $('.toggle-chat').on('click', this.togglechat.bind(this))
        },
        togglechat: function (e) {
            $('.chat-box').toggleClass('none')
        },
        getMsg: function (e) {
            if ($(e.target).val().replace(/\s/g, '').length) {
                this.socket.emit('typing', { id: this.companyId })
            } else {

                this.socket.emit('stopTyping', { id: this.companyId })
            }
            this.newMessage = $(e.target).val()
        },
        sendMessage: async function (e) {
            e.preventDefault()
            this.socket.emit("message", { id: this.companyId, msg: this.newMessage });
            this.renderNewMsg({ message: this.newMessage, type: 0 })
            this.newMessage = ''
            $('#group-msg').val('   ')
            this.socket.emit('stopTyping', { id: this.companyId })

        },
        renderNewMsg: function (msg) {
            $('#messages ').append(`
            <li ${msg.type === 0 ? 'style="float:left"' : 'style="float:right"'}><span class="block font-xs c-b">${msg.type === 1 ? msg.user : ''}</span>${msg.message}</li>
            `)
        }

    }
    chat.init()
})()



