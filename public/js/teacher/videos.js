/*jslint browser: true*/

/*global console, alert, $, jQuery*/

(function () {
    const videos = {
        fileUploaded: 0,
        file: null,
        FReader: null,
        Name: null,
        lessonId: document.querySelector('input[name="lessonId"]').value,
        selectedFile: null,
        socket: io.connect('localhost:3000'),
        init: function () {
            this.cashDom()
            this.bindEvents()
            // this.checkBroswerSupport()
            // this.socket.on('MoreData', function (data) {

            //     let per = Math.floor(data['Percent'])
            //     videos.UpdateBar(per);
            //     var Place = data['Place'] * 524288; //The Next Blocks Starting Position
            //     let NewFile; //The Variable that will hold the new Block of Data
            //     if (videos.selectedFile.webkitSlice)
            //         NewFile = videos.selectedFile.webkitSlice(Place, Place + Math.min(524288, (videos.selectedFile.size - Place)));
            //     else
            //         NewFile = videos.selectedFile.slice(Place, Place + Math.min(524288, (videos.selectedFile.size - Place)));
            //     videos.FReader.readAsBinaryString(NewFile);
            // });
            // videos.socket.on('Done', function (data) {
            //     $('#cancelButton').addClass('hidden')
            //     videos.submitVideo(data)
            // });


        },
        Refresh: function () {
            location.reload(true);
        },
        cashDom: function () {
            this.$videoFrom = $('.toggle-video-form')
            // this.bar = document.getElementsByClassName("progress-bar")[0];
            // this.lessonId = document.querySelector('input[name="lessonId"]').value;
        },
        bindEvents: function () {
            this.$videoFrom.on('click', function () {
                if (videos.fileUploaded > 0) {
                    videos.Refresh()

                } else {
                    $('#videoForm').toggleClass('hidden')
                }
            })
            $('#UploadButton').on('click', this.submitVideo.bind(this))
        },
        // checkBroswerSupport: async function () {
        //     videos.bar.style = `--progress: ${0}`;
        //     window.addEventListener("load", Ready);
        //     function Ready() {
        //         if (window.File && window.FileReader) { //These are the relevant HTML5 objects that we are going to use 
        //             document.getElementById('UploadButton').addEventListener('click', videos.StartUpload);
        //             document.getElementById('FileBox').addEventListener('change', videos.FileChosen);
        //         }
        //         else {
        //             document.getElementById('UploadArea').innerHTML = "Your Browser Doesn't Support The File API Please Update Your Browser";
        //         }
        //     }
        // },
        // UpdateBar: function (percent) {
        //     let barPerc = percent
        //     if (percent >= 0.45) {
        //         $('.box p').addClass('c-b')
        //     }
        //     videos.bar.style = `--progress: 00.${percent}`;
        //     document.getElementById('percent').innerHTML = (Math.round(percent * 100) / 100);
        //     var MBDone = Math.round((percent * videos.selectedFile.size) / 1048576);
        //     $('#mb').html(MBDone);
        // },
        // FileChosen: function (evnt) {
        //     console.log('FileChosen');
        //     videos.selectedFile = evnt.target.files[0];
        //     document.getElementById('NameBox').value = videos.selectedFile.name;
        //     $('.mb').html("<span id='Uploaded'> - <span id='mb'>0</span>/" + Math.round(videos.selectedFile.size / 1048576) + "MB</span>")

        // },
        // StartUpload: function (e) {

        //     if (document.getElementById('FileBox').value != "") {
        //         $('#UploadButton').off('click');
        //         // console.log('upload started');

        //         $('.video-title').addClass('hidden')
        //         $('.video-input').addClass('hidden')
        //         $('#UploadButton').addClass('hidden')
        //         $('#cancelButton').removeClass('hidden')
        //         videos.FReader = new FileReader();
        //         videos.Name = document.getElementById('NameBox').value;

        //         // var Content = "<span id='NameArea'>Uploading " + videos.selectedFile.name + " as " + videos.Name + "</span>";

        //         videos.FReader.onload = function (evnt) {
        //             console.log(evnt);
        //             videos.socket.emit('upload', { 'Name': videos.Name, Data: evnt.target.result });

        //         }
        //         videos.socket.emit('Start', { 'Name': videos.Name, 'Size': videos.selectedFile.size });

        //     }
        //     else {
        //         alert("Please Select A File");
        //     }
        // },
        submitVideo: async function (info) {
            $('#UploadBox').addClass('loader-effect')
            const title = document.getElementById('videoTitle').value;
            const url = document.getElementById('videoUrl').value;
            const data = await fetchdata(`/teacher/videos/${videos.lessonId}`, 'post', JSON.stringify({ path: url, title: title }), true)
            if (data != null) {
                // var content = ""
                // content += "<img id='Thumb' src='" + 'http://localhost:4000' + data['Image'] + "' alt='" + videos.Name + "'><br>";
                // content += "<button  type='button' name='Upload' value='' id='Restart' class='btn btn-success'>Upload Another</button>";
                // $('#UploadButton').remove()
                // videos.bar.classList.add("done");
                // videos.bar.style = `--progress: 1`;
                // document.getElementById('UploadArea').innerHTML += content;
                // document.getElementById('Restart').addEventListener('click', videos.Refresh);
                $('#UploadBox').removeClass('loader-effect')
                location.reload(true);
            }

        }

    }


    videos.init()
})()
