const IP = "http://localhost:8888/"

function locationArgs() {
    var pairs = window.location.search.substring(1).split("&"),
      obj = {},
      pair,
      i;
  
    for ( i in pairs ) {
      if ( pairs[i] === "" ) continue;
  
      pair = pairs[i].split("=");
      obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
    }
  
    return obj;
  }

function sessioned(dic){
    if (typeof sessionStorage["limoncello-sessionId"] != "undefined"){
        dic["sessionId"] = sessionStorage["limoncello-sessionId"];
    }
    return dic;
}

function checkPerm(perm) {
    return $.ajax({
        type: "GET",
        url: IP + "user/checkPerm",
        async: false,
        data: sessioned({
            "perm": perm
        }),
        dataType: "json"
    }).responseJSON;
}

function isAuth() {
    let result;
    $.ajax({
        type: "GET",
        url: IP + "user/auth",
        data: sessioned({}),
        async: false,
        dataType: "json",
        error: function(x){
            if (x.status === 0){
                result = "ERR_NOT_AVAILABLE";
            }
        },
        success: function(response){
            result = response;
        }
    });
    return result;
}

function needPassword(){
    let result;
    if (typeof sessionStorage["limoncello-sessionId"] !== "undefined"){
        $.ajax({
            type: "GET",
            url: IP + "user/changePassword",
            data: sessioned({}),
            async: false,
            dataType: "json",
            error: function(x){
                if (x.status === 0){
                    result = "ERR_NOT_AVAILABLE";
                }
            },
            success: function(response){
                result = response == "NEEDED";
            }
        });
        return result;
    }
}

function getUserInfo(){
    let result;
    if (typeof sessionStorage["limoncello-sessionId"] !== "undefined"){
        $.ajax({
            type: "GET",
            url: IP + "user/selfInfo",
            data: sessioned({}),
            async: false,
            dataType: "json",
            error: function(x){
                if (x.status === 0){
                    result = "ERR_NOT_AVAILABLE";
                }
            },
            success: function(response){
                result = response;
            }
        });
        return result;
    }
}