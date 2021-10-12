

function rendercog(){
    $('#alert-before').val(data.cog.alert_before).change(()=>{
        data.cog.alert_before = $('#alert-before').val();
        save();
    });
}