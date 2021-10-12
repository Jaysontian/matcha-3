function creatEvent(dayselected, val, idnum, time, link){
    initsnap = true;
    var id;
    if (idnum != null){// already existing timestamp id
        id = idnum;
    } else { // if this is a new event, create  a new timestamp id
        id = Date.now();
        data[dayselected].push({
            id: id,
            val: "",
            type: "event",
            time: "ND",
            link: '',
            color:'var(--light-green)'
        });
        save();
    };

    var task; // finding the 'task' in the data and setting a variable to allow edits
    var index;
    jQuery.each(data, (i, date) => { // iterating to find the task
        jQuery.each(date, (k, datetask)=>{
            if (datetask.id == id){
                if (data[i][k].time != 'ND'){
                    
                    //data[i][k].time = Date.parse((data[i][k].time).replace('('+(data[i][k].time).split('(')[1].split(')')[0]+')',''));
                    //data[i][k].time = new Date(data[i][k].time);
                }  
                task = data[dayselected][k];
                index = k;
            }
        })
    });

    var note;

    if($('#events-'+dayselected).length){
        note = $('<div class="event">').prependTo($('#events-'+dayselected)).attr('id',  id).css('background-color',task.color);
        $('<time>').appendTo(note);
        $('<p contenteditable="true">').appendTo(note);

        if (task.link != ''){
            if (!task.link.includes('https')){task.link = 'https://' + task.link}
            note.find('time').addClass('link').click(()=>{void(0);window.open(task.link, '_blank')});
        }
    } else { 
        // if the task does not exist
        var head;
        if(! $('.H-'+dayselected).length){
            head = $('<div>').html('<h3>'+dateToNatural(stringToDate(dayselected))+'</h3>').prependTo('#archived').addClass('H-'+dayselected+' datehead');  
        }
        note = $('#day-tasks').addClass('day-tasks').appendTo('.H-'+dayselected).attr('id',  id);
    }

    //******************************************************* */ time
    if (task.time == 'ND'){
        parsed = 'ND'
    } else {
        parsed = codeToTime(task.time);

    }
    note.find('time').text(parsed);



    //******************************************************* */ field editor
    var field = (note.find('p')).focus().html(val);
    field.keypress((e)=>{ // if user types in task
        strokenow = String.fromCharCode(e.keyCode);
        // console.log(strokenow, strokeback, strokeback2);
        if (strokenow == ' ' && strokeback == 'r' && strokeback2 == '/') {
            e.preventDefault();
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().deleteFromDocument();
            task.color = 'var(--red)';
            note.css('background-color','var(--red)')
        }
        if (strokenow == ' ' && strokeback == 'b' && strokeback2 == '/') {
            e.preventDefault();
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().deleteFromDocument();
            task.color = 'var(--blue)';
            note.css('background-color','var(--blue)')
        }
        if (strokenow == ' ' && strokeback == 'y' && strokeback2 == '/') {
            e.preventDefault();
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().deleteFromDocument();
            task.color = 'var(--yellow)';
            note.css('background-color','var(--yellow)')
        }
        if (strokenow == ' ' && strokeback == 'g' && strokeback2 == '/') {
            e.preventDefault();
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().deleteFromDocument();
            task.color = 'var(--light-green)';
            note.css('background-color','var(--light-green)')
        }
        if (strokenow == ' ' && strokeback == 'k' && strokeback2 == '/') { // ************* NEW LINK SHORTCUT
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().modify("extend", "backward", "character");
            window.getSelection().deleteFromDocument();
            var newlink = prompt('Link', task.link);
            if (newlink == '' || newlink == null){
                note.find('time').removeClass('link').click(()=>{return false});
                task.link = '';
                save();
                refreshEvents(dayselected);
            } else {
                if (validURL(newlink)){
                    if (!newlink.includes('https')){newlink = 'https://' + newlink}
                    note.find('time').addClass('link').click(()=>{void(0);window.open(newlink, '_blank')});
                    task.link = newlink;
                    updateNotif(dayselected, id, task.time, task.val, newlink);
                    save();
                } else {alert('Please insert valid link.')}
            }
        }
        if (e.shiftKey && e.keyCode == 13){ //******************** another new Task
            e.preventDefault();
            creatEvent(dayselected);
        }
        strokeback2 = strokeback;
        strokeback = strokenow;
    });

    field.keydown((e)=>{
        if (e.keyCode == 46 || e.keyCode == 8){ //******************** deleting a task
            if (field.text()==''){
                e.preventDefault();  
                note.remove();
                data[dayselected].splice(index, 1);
                deleteNotif(id);
                save();
            }
        }
        if (e.shiftKey && e.keyCode == 8){ //******************** deleting task (shortcut)
            e.preventDefault();  
            note.remove();
            data[dayselected].splice(index, 1);
            deleteNotif(id);
            save();
        }
        if ((e.metaKey && e.keyCode == 75) || (e.shiftKey && e.keyCode == 75)){ //******************** adding a link
            e.preventDefault();
            var newlink = prompt('Link', task.link);
            if (newlink == '' || newlink == null){
                note.find('time').removeClass('link').click(()=>{return false});
                task.link = '';
                save();
                updateNotif(dayselected, id, task.time, task.val, newlink);
                refreshEvents(dayselected);
            } else {
                if (validURL(newlink)){
                    if (!newlink.includes('https')){newlink = 'https://' + newlink}
                    note.find('time').addClass('link').click(()=>{void(0);window.open(newlink, '_blank')});
                    task.link = newlink;
                    save();
                    updateNotif(dayselected, id, task.time, task.val, newlink);
                } else {alert('Please insert valid link.')}
            }
        }
    });
    field.keyup(e=>{
        var fieldText = field.text();
        if (fieldText.includes('(') && fieldText.includes(')')){ /// if there is time change
            var fieldTime = fieldText.substring(fieldText.indexOf("(") + 1, fieldText.lastIndexOf(")"));
            fieldText = fieldText.replace('('+fieldTime+')', '');
            task.time = timeToCode(fieldTime);
            save();
            note.find('time').text(codeToTime(task.time));
            refreshEvents(dayselected, id, fieldTime);
            updateNotif(dayselected, id, task.time, fieldText, task.link);
        }
        updateNotif(dayselected, id, task.time, fieldText, task.link);
        task.val = field.html();
        save();
    });
};

function deleteNotif(id){
    console.log('deleting notif')
    navigator.serviceWorker.getRegistration().then(reg=>{
        reg.getNotifications({
            includeTriggered: true
        }).then(notifications => {
            notifications.forEach(notification=>{
                if (notification.tag == id){
                    notification.close();
                    console.log('success.')
                }
            })
        });
    });
}

function updateNotif(dayselected, id, time, val, link){
    var f_time = time;
    var f_val = val;
    var f_link = link;
    var close;

    navigator.serviceWorker.getRegistration().then(reg=>{
        reg.getNotifications({
            includeTriggered: true
        }).then(notifications => {
            notifications.forEach(notification=>{
                if (notification.tag == id){
                    close = notification;
                }
            })
        });
    });

    if (close !=null){
        close.close(); // 6 min = 36,000 // 1 min = 6,000
    }

    var a = Date.parse(f_time);
    a.setFullYear(parseInt((dayselected.toString()).substring(0, 4)));
    a.setMonth(parseInt((dayselected.toString()).substring(4, 6))-1);
    a.setDate(parseInt((dayselected.toString()).substring(6,8)));
    if (data.cog.alert_before == null || data.cog.alert_before == ''){data.cog.alert_before =10; save()}
    b = new Date(a.getTime() - 60000 * data.cog.alert_before);
    displayNotification(f_val, a.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }), b, id, f_link);
    console.log(b);
}

function refreshEvents(dayselected, id, fieldTime){
    var eventarray = [];
    var ndarray = [];
    (data[dayselected]).forEach(i=>{
        if (i.type == 'event' && i.time!='ND'){
            eventarray.push(i)
        }
        if (i.type == 'event' && i.time=='ND'){
            ndarray.push(i)
        }
    });
    var sorted = eventarray.sort(function(a, b) {
        var c = parseFloat((a.time).substring(0, (a.time).length - 2).replace(':','.'));
        var d = parseFloat((b.time).substring(0, (b.time).length - 2).replace(':','.'));
        return c-d;
    });

    sorted = ndarray.concat(sorted);
    sorted = sorted.reverse();
    $('#events-'+dayselected).empty();
    var processed = 0;
    sorted.forEach(sortednote => {
        creatEvent(dayselected, sortednote.val, sortednote.id);
        processed++;
        if (processed == sorted.length){
            //the end
            if (id){
                $('#'+id+' p').html(($('#'+id+' p').html()).replace('('+fieldTime,''));  
                $('#'+id+' p').focus(); 
                document.execCommand('selectAll', false, null);
                document.getSelection().collapseToEnd();
            }
        }

    });
}


function toDateTime(secs) {
    var t = new Date(1970, 0, 1); // Epoch
    t.setSeconds(secs);
    return t;
}

function timeToCode(string){ // 5pm
    var a = (new Date.parse(string + ' October 1, 2021')).toTimeString().split(' ')[0];
    return a
}

function codeToTime(code){
    var a = new Date.parse(code);
    return a.toString('h:mm');
}

function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }