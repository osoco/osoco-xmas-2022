// FUNCIONES
    // 01- Mostramos Tarjeta

//  DISPARADORES
    // 01- Mostramos Tarjeta
// ------------------------------------------ 

$(function(){
    
    // 01- Mostramos Tarjeta
    const closeCars = (elementoHelp) => {  
        $('div').removeClass('ooo-active');
        $('body').removeClass('ooo-active');
    }

    // 02 - Mostrar LightBox
    const showLightBox = (windowSize) => {  
        setTimeout( function() { //esperamos 1000
            $('.ooo-lightBox').addClass('ooo-active');
            $('body').addClass('ooo-active');
        }, windowSize);
    }


// -----------------------------------------------------------------------------------------------------------
//  DISPARADORES
    // 01- Mostramos Tarjeta
    $(".js-openCard").click(function () {
        if( $(".ooo-active").length ){
            if($(this).hasClass('ooo-active')){
                closeCars();
                return;
            }
            closeCars();
        }
        $
        $(this).addClass('ooo-active');
        showLightBox(1000);
    });
    $(".js-lightBox").click(function () {
        closeCars();
    });
});
