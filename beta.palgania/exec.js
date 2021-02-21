/* 
ici on unitialise les fonction
*/
WGetOpenView('wget/wget.nav.html','#main-nav', 'html');
WGetOpenView('wget/wget.right_block_main.html','#main-body-right', 'html');

if($.cookie('file') > "")
{
    a=$.cookie('file');
    WGetOpenView(a,'#main-body-left', 'html');
}
else
{
    WGetOpenView('root/home.html','#main-body-left', 'html');
}

function refresh(a)
{
    
}

// setInterval("refresh('#main-body-left')", 1000)