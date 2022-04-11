$(function(){


    // $("a").click(function(e){
    //     if (!($(this).hasClass("palgania-namespace-palgclass") || $(this).attr("target") == "_blank")){
    //         $(this).addClass("palgania-namespace-palgclass");
    //         e.preventDefault();
    //         let el = this;
           
            
    //     }
    // });

    if (/^https:\/\/www\.serveurs-minecraft\.org\/vote\.php\?id=62219&href=/.test(location.href)){
        if ($(".yes").length > 0){
            $(".yes").trigger("click");
        } else {
            if (/déjà voté/.test(document.body.textContent)){
                $.ajax({
                    type: "POST",
                    url: "https://palgania.ovh:8443/services/checkvote",
                    dataType: "json",
                    success: function (response) {
                        let url = new URL(location.href);
                        location.href = url.searchParams.get("href");
                    },
                    error: function(x){
                        let url = new URL(location.href);
                        location.href = url.searchParams.get("href");
                    }
                });

            } else {
                let url = new URL(location.href);
                location.href = url.searchParams.get("href");

            }
        }
    } else {
        $.ajax({
            type: "GET",
            url: "https://palgania.ovh:8443/services/checkvote",
            dataType: "json",
            success: function (response) {
                console.log(response);
                if (!response){
                    location.href = "https://www.serveurs-minecraft.org/vote.php?id=62219&href=" + location.href;
                }
                
            }
        });
    }
});
