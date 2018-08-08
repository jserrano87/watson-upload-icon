const dialog = require('electron').remote.dialog;
const request = require("request");
const fs = require("fs");

// WW endpoints
const _watsonOAuthUrl = 'https://api.watsonwork.ibm.com/oauth/token';
const _watsonPhotoUrl = 'https://api.watsonwork.ibm.com/photos';
let _imagePath = '';

function openImage() {
    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [{
            name: 'Images',
            extensions: ['jpg']
        }]
    }, function(file) {
        if(!!file) {
            _imagePath = file[0];
            document.getElementById('imgUpload').src = _imagePath;
        }
    });
};

function uploadImage() {
    let appId =  document.getElementById('frmAppIp').value;
    let appSecret =  document.getElementById('frmAppSecret').value;
    let log = document.getElementById('log');

    if (!appId || !appSecret) {
        log.insertAdjacentHTML('beforeend', `<p>Please, enter app ID/app secret.</p>`);
    } else if (!_imagePath){
        log.insertAdjacentHTML('beforeend', `<p>Please, select the image of your application.</p>`);
    } else {
        let auth = "Basic " + new Buffer(`${appId}:${appSecret}`).toString("base64");

        let options = { 
            method: 'POST',
            url: _watsonOAuthUrl,
            headers: { 
                'Authorization' : auth,
                'Content-Type': 'application/x-www-form-urlencoded' 
            },
            form: { 
                grant_type: 'client_credentials' 
            }
        };
    
        request(options, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                let r = JSON.parse(body);
                if (r.access_token) {
                    log.insertAdjacentHTML('beforeend', `<p>Access token obtained correctly.</p>`);

                    let optionsPhoto = {
                        method: 'POST',
                        url: _watsonPhotoUrl,
                        headers: { 
                            'Authorization' : `Bearer ${r.access_token}`,
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        formData: { 
                            file: { 
                                value: fs.createReadStream(_imagePath),
                                options: { 
                                    filename: 'photo',
                                    contentType: null
                                }
                            }
                        }
                    };

                    request(optionsPhoto, function (errorPhoto, responsePhoto, bodyPhoto) {
                        if (!errorPhoto && responsePhoto.statusCode === 200) {
                            log.insertAdjacentHTML('beforeend', `<p>Photo uploaded successfully.</p>`);
                        } else {
                            log.insertAdjacentHTML('beforeend', `<p>(413) Too large: Please check your photo attributes (max. 300KB).</p>`);
                        }
                    });

                } else {
                    log.insertAdjacentHTML('beforeend', `<p>Error getting the token.</p>`);
                }
            } else if (response.statusCode === 401) {
                let r = JSON.parse(body);
                log.insertAdjacentHTML('beforeend', `<p>(${r.status}) ${r.error}: ${r.message}</p>`);
            } else {
                log.insertAdjacentHTML('beforeend', `<p>Error getting the token.</p>`);
            }
        });
    }
    

}

var handleRedirect = (e) => {
    e.preventDefault();
    require('electron').shell.openExternal("https://dekkaiinsight.com");
}

document.querySelector('#imgUpload').addEventListener('click', openImage);
document.querySelector('#btnUpload').addEventListener('click', uploadImage);
document.querySelector('#openDI').addEventListener('click', handleRedirect);
