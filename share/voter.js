$(function(){


    $("a").click(function(e){
        if (!($(this).hasClass("palgania-namespace-palgclass") || $(this).attr("target") == "_blank")){
            $(this).addClass("palgania-namespace-palgclass");
            e.preventDefault();
            let el = this;
            $.ajax({
                type: "GET",
                url: "https://palgania.ovh:8888/services/checkvote",
                dataType: "json",
                success: function (response) {
                    if (response){
                        el.click();
                    } else {
                        location.href = "https://www.serveurs-minecraft.org/vote.php?id=62219&href=" + el.href;
                    }
                    
                }
            });
            
        }
    });

    if (/^https:\/\/www\.serveurs-minecraft\.org\/vote\.php\?id=62219&href=/.test(location.href)){
        if ($(".yes").length > 0){
            $(".yes").trigger("click");
        } else {
            let url = new URL(location.href);
            location.href = url.searchParams.get("href");
        }
    }
});