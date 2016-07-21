$(document).ready(function () {

    $.post('/', function (data, status) {
        $('.firewareInfoContainer').html(data);
    });

    $('#menuUploadButton').on('click', function () {
        $('#upload-input').click();
        $('.progress-bar').text('0%');
        $('.progress-bar').width('0%');
    });

    $('#upload-input').on('change', function () {

        var files = $(this).get(0).files;

        if (files.length > 0) {

            var formData = new FormData();

            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                formData.append('uploads[]', file, file.name);
            }

            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (data) {
                    $('.firewareInfoContainer').prepend(data);
                    // alert('ssdddd');
                },
                xhr: function () {
                    // create an XMLHttpRequest
                    var xhr = new XMLHttpRequest();

                    // listen to the 'progress' event
                    xhr.upload.addEventListener('progress', function (evt) {

                        if (evt.lengthComputable) {
                            // calculate the percentage of upload completed
                            var percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100);

                            // update the Bootstrap progress bar with the new percentage
                            $('.progress-bar').text(percentComplete + '%');
                            $('.progress-bar').width(percentComplete + '%');

                            // once the upload reaches 100%, set the progress bar text to done
                            if (percentComplete === 100) {
                                $('.progress-bar').html('完成');
                            }
                        }
                    }, false);

                    return xhr;
                }
            });

        }
    });

    $('#getDownloadLinkButton').click(function () {
        var localFirmwareVersion = $('#localFirmwareVersion').val(),
            upgradeOption = $('#upgradeOption').is(":checked");

        $.post('/getDownloadLink/' + localFirmwareVersion + '&' + upgradeOption, function (data, status) {
            $('#downloadLinkSpan').html(data);
        });

    })

});
