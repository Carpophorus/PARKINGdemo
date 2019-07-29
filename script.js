(function(global) {

    var P = {};
    var mostRecentResponse = null;

    let apiRoot = 'https://api.parking-pilot.com/';
    let apiKey = '?api_key=4B160CD3C5BD53B146571C440F11D1CB';
    let leftCam = 'http://10.0.16.46/jpg/image.jpg';
    let rightCam = 'http://10.0.16.45/jpg/image.jpg';

    getRequestObject = function() {
        if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else {
            global.alert("Ajax is not supported!");
            return null;
        }
    };

    sendGetRequest = function(requestUrl, responseHandler, isJsonResponse, bearer) {
        var request = getRequestObject();
        request.onreadystatechange = function() {
            handleResponse(request, responseHandler, isJsonResponse);
        };
        request.open("GET", requestUrl, true);
        if (bearer !== null) request.setRequestHeader('Authorization', 'Bearer ' + bearer);
        request.send(null);
    };

    handleResponse = function(request, responseHandler, isJsonResponse) {
        if (request.readyState === 4) {
            if (request.status === 200 || request.status === 201 || request.status === 204) {
            if (isJsonResponse === undefined)
                isJsonResponse = true;
            if (isJsonResponse)
                responseHandler(JSON.parse(request.status === 204 || request.responseText === '' ? null : request.responseText), request.status);
            else
                responseHandler(request.status === 204 || request.responseText === '' ? null : request.responseText, request.status);
            } else if (request.status === 400 || request.status >= 500) {
            var errorText = JSON.parse(request.responseText).error;
            $(".jconfirm").remove();
            $.confirm({
                title: 'GREŠKA!',
                content: errorText,
                theme: 'supervan',
                backgroundDismiss: 'true',
                buttons: {
                ok: {
                    text: 'ОК',
                    btnClass: '',
                    keys: ['enter'],
                    action: function() {}
                }
                }
            });
            } else {
                $(".jconfirm").remove();
                $.confirm({
                    title: 'GREŠKA!',
                    content: 'Desila se greška u sistemu, pokušajte ponovo.',
                    theme: 'supervan',
                    backgroundDismiss: 'true',
                    buttons: {
                    ok: {
                        text: 'ОК',
                        btnClass: '',
                        keys: ['enter'],
                        action: function() {}
                    }
                    }
                });
            }
        }
    };

    P.getFullStatus = function(idSensor, idSpace) {
        sendGetRequest(
            apiRoot + 'parkingspaces/' + idSensor + '/status' + apiKey,
            function(response, status) {
                $(".jconfirm").remove();
                var date = new Date(response.last_change * 1000);
                var dateString = '' + date.getFullYear() + '.' + ('0' + (date.getMonth() + 1)).slice(-2) + '.' + ('0' + date.getDate()).slice(-2) + '. ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2) + ':' + ('0' + date.getSeconds()).slice(-2);
                $.confirm({
                    title: 'MESTO ' + idSpace,
                    content: `<br><img id="snapshot" src="` + (idSpace == 1 || idSpace == 2 || idSpace == 10 || idSpace == 12 || idSpace == 16 || idSpace == 17 ? rightCam : leftCam) + `" width="500" height="auto" onclick="if ($('#snapshot').attr('width') == 500) $('#snapshot').attr('width', '` + window.innerWidth + `'); else $('#snapshot').attr('width', 500);" onload="setTimeout(function() {$('#snapshot').attr('src', '` + (idSpace == 1 || idSpace == 2 || idSpace == 10 || idSpace == 12 || idSpace == 16 || idSpace == 17 ? rightCam : leftCam) + `');}, 2000);"><br>` + `<br>Kompanija: ...<br>Telefon: ...<br>` + (response.occupied === true ? 'Zauzeto' : 'Slobodno') + ' od ' + dateString,
                    theme: 'supervan',
                    backgroundDismiss: 'true',
                    buttons: {
                    ok: {
                        text: 'ОК',
                        btnClass: '',
                        keys: ['enter'],
                        action: function() {}
                    }
                    }
                });
            },
            true, null
        );
    };

    processResponse = function(response) {
        if (mostRecentResponse == null) {
            mostRecentResponse = response;
            return;
        }
        for (var i = 0; i < mostRecentResponse.length; i++)
            if (mostRecentResponse[i].occupied == false && response[i].occupied == true) {
                //PlaySound("beep");
                $.confirm({
                    title: '<span class="alert">MESTO ' + response[i].xml_id + '</span>',
                    content: '<span class="alert">Neko je upravo zauzeo mesto ' + response[i].xml_id + '!</span>',
                    theme: 'supervan',
                    backgroundDismiss: 'true',
                    buttons: {
                    ok: {
                        text: 'ОК',
                        btnClass: '',
                        keys: ['enter'],
                        action: function() {}
                    }
                    }
                });
                if ($('.jconfirm.jconfirm-supervan .jconfirm-bg').find('.alert').length != 0)
                    $('.jconfirm.jconfirm-supervan .jconfirm-bg').addClass('has-alert');
                //$('.jconfirm.jconfirm-supervan .jconfirm-bg:has(span.alert)').addClass('has-alert');
            } else if (mostRecentResponse[i].occupied == true && response[i].occupied == false) {
                //PlaySound("beep"); //clink
                $.confirm({
                    title: '<span class="notification">MESTO ' + response[i].xml_id + '</span>',
                    content: '<span class="notification">Neko je upravo oslobodio mesto ' + response[i].xml_id + '.</span>',
                    theme: 'supervan',
                    backgroundDismiss: 'true',
                    buttons: {
                    ok: {
                        text: 'ОК',
                        btnClass: '',
                        keys: ['enter'],
                        action: function() {}
                    }
                    }
                });
                if ($('.jconfirm.jconfirm-supervan .jconfirm-bg').find('.notification').length != 0)
                    $('.jconfirm.jconfirm-supervan .jconfirm-bg').addClass('has-notification');
                //$('.jconfirm.jconfirm-supervan .jconfirm-bg:has(span.notification)').addClass('has-notification');
            }
        mostRecentResponse = response;
    };

    retrieveStatuses = function(idLot) {
        sendGetRequest(
            apiRoot + 'parkinglots/' + idLot + '/parkingspaces' + apiKey,
            function(response, status) {
                setTimeout(function() { retrieveStatuses(idLot); }, 2000);
                console.log('ping');
                var array = response.sort(function(a, b) { return a.xml_id - b.xml_id; });
                processResponse(array);
                var html = '';
                for(var i = 0; i < 9; i++)
                    html += '<div class="v ' + (array[i].occupied === true ? 'occupied' : 'free') + '" onclick="$P.getFullStatus(' + array[i].id + ', ' + array[i].xml_id + ');">' + array[i].xml_id + '</div>';
                html += '<br>';
                for(var s = 0; s < 9; s++)
                    html += '<div class="v-space"></div>';
                html += '<br>';
                for(i = 16; i > 11; i--)
                    html += '<div class="v ' + (array[i].occupied === true ? 'occupied' : 'free') + '" onclick="$P.getFullStatus(' + array[i].id + ', ' + array[i].xml_id + ');">' + array[i].xml_id + '</div>';
                for(s = 0; s < 2; s++)
                    html += '<div class="v-space"></div>';
                for(i = 10; i > 8; i--)
                    html += '<div class="v ' + (array[i].occupied === true ? 'occupied' : 'free') + '" onclick="$P.getFullStatus(' + array[i].id + ', ' + array[i].xml_id + ');">' + array[i].xml_id + '</div>';
                html += '<br><div class="square-space"></div>';
                for(i = 17; i < 19; i++)
                    html += '<div class="h ' + (array[i].occupied === true ? 'occupied' : 'free') + '" onclick="$P.getFullStatus(' + array[i].id + ', ' + array[i].xml_id + ');">' + array[i].xml_id + '</div>';
                html += '<div class="h-space"></div>';
                html += '<div class="h ' + (array[11].occupied === true ? 'occupied' : 'free') + '" onclick="$P.getFullStatus(' + array[11].id + ', ' + array[11].xml_id + ');">' + array[11].xml_id + '</div>';
                $('.parking').html(html);
            },
            true, null
        );
    };

    sendGetRequest(
        apiRoot + 'parkinglots' + apiKey,
        function(response, status) {
            retrieveStatuses(response[0].id);
        },
        true, null
    );

    global.$P = P;

})(window);