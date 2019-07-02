(function(global) {

    var P = {};

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

    let apiRoot = 'https://api.parking-pilot.com/';
    let apiKey = '?api_key=4B160CD3C5BD53B146571C440F11D1CB';

    P.getFullStatus = function(idSensor) {
        //
    };

    retrieveStatuses = function(idLot) {
        sendGetRequest(
            apiRoot + 'parkinglots/' + idLot + '/parkingspaces' + apiKey,
            function(response, status) {
                //console.log(response);
                //console.log(response.sort(function(a, b) { return a.xml_id - b.xml_id; }));
                //setTimeout(retrieveStatuses(idLot), 10000);
                var array = response.sort(function(a, b) { return a.xml_id - b.xml_id; });
                var html = '';
                for(var i = 0; i < 9; i++)
                    html += '<div class="v ' + ((i !== 2 && i !== 6) ? (array[i].occupied === true ? 'occupied' : 'free') : '') + '" onclick="$P.getFullStatus(' + array[i].id + ');">' + array[i].xml_id + '</div>';
                html += '<br>';
                for(var s = 0; s < 9; s++)
                    html += '<div class="v-space"></div>';
                html += '<br>';
                for(i = 16; i > 11; i--)
                    html += '<div class="v ' + ((i !== 17) ? (array[i].occupied === true ? 'occupied' : 'free') : '') + '" onclick="$P.getFullStatus(' + array[i].id + ');">' + array[i].xml_id + '</div>';
                for(s = 0; s < 2; s++)
                    html += '<div class="v-space"></div>';
                for(i = 10; i > 8; i--)
                    html += '<div class="v ' + (array[i].occupied === true ? 'occupied' : 'free') + '" onclick="$P.getFullStatus(' + array[i].id + ');">' + array[i].xml_id + '</div>';
                html += '<br><div class="square-space"></div>';
                for(i = 17; i < 19; i++)
                    html += '<div class="h ' + (array[i].occupied === true ? 'occupied' : 'free') + '" onclick="$P.getFullStatus(' + array[i].id + ');">' + array[i].xml_id + '</div>';
                html += '<div class="h-space"></div>';
                html += '<div class="h ' + (array[11].occupied === true ? 'occupied' : 'free') + '" onclick="$P.getFullStatus(' + array[11].id + ');">' + array[11].xml_id + '</div>';
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