class Metronome
{
    constructor(tempo = 120)
    {
        this.audioContext = null;
        this.notesInQueue = [];         // notes that have been put into the web audio and may or may not have been played yet {note, time}
        this.currentBeatInBar = 0;
        this.beatsPerBar = 4;
        this.tempo = tempo;
        this.lookahead = 25;          // How frequently to call scheduling function (in milliseconds)
        this.scheduleAheadTime = 0.1;   // How far ahead to schedule audio (sec)
        this.nextNoteTime = 0.0;     // when the next note is due
        this.isRunning = false;
        this.intervalID = null;
    }

    nextNote()
    {
        var c = document.getElementById("circles").getElementsByClassName("circle")[this.currentBeatInBar];
        // Advance current note and time by a quarter note (crotchet if you're posh)
        var secondsPerBeat = 60.0 / this.tempo; // Notice this picks up the CURRENT tempo value to calculate beat length.
        this.nextNoteTime += secondsPerBeat; // Add beat length to last beat time

        if (this.currentBeatInBar == 0) {
            var d = document.getElementById("circles").getElementsByClassName("circle");
        for(var i =0; i<d.length; i++){
            d[i].style.backgroundColor = '#bbb';
        }
        }   
        c.style.backgroundColor = "var(--pink)";
        this.currentBeatInBar++;    // Advance the beat number, wrap to zero
        if (this.currentBeatInBar == this.beatsPerBar ) {
            this.currentBeatInBar = 0;
        }
        
    }

    scheduleNote(beatNumber, time)
    {
        // push the note on the queue, even if we're not playing.
        this.notesInQueue.push({ note: beatNumber, time: time });
    
        // create an oscillator
        const osc = this.audioContext.createOscillator();
        const envelope = this.audioContext.createGain();
        
        osc.frequency.value = (beatNumber % this.beatsPerBar == 0) ? 1000 : 800;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(1, time + 0.001);
        envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.02);

        osc.connect(envelope);
        envelope.connect(this.audioContext.destination);
    
        osc.start(time);
        osc.stop(time + 0.03);
    }

    scheduler()
    {
        // while there are notes that will need to play before the next interval, schedule them and advance the pointer.
        while (this.nextNoteTime < this.audioContext.currentTime + this.scheduleAheadTime ) {
            this.scheduleNote(this.currentBeatInBar, this.nextNoteTime);
            this.nextNote();
        }
    }

    start()
    {
        if (this.isRunning) return;

        if (this.audioContext == null)
        {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        this.isRunning = true;

        this.currentBeatInBar = 0;
        this.nextNoteTime = this.audioContext.currentTime + 0.05;

        this.intervalID = setInterval(() => this.scheduler(), this.lookahead);
    }

    stop()
    {
        this.isRunning = false;

        clearInterval(this.intervalID);

        var c = document.getElementById("circles").getElementsByClassName("circle");
        for(var i =0; i<c.length; i++){
            c[i].style.backgroundColor = '#bbb';
        }

    }

    startStop()
    {
        if (this.isRunning) {
            this.stop();
        }
        else {
            this.start();
        }
    }
}







var metronome = new Metronome();
const slider = document.getElementById('slider');
const BPM = document.getElementById('BPM');
const beats = document.getElementById('bpm');
const increaseBPM = document.getElementById('increase-BPM');
const reduceBPM = document.getElementById('reduce-BPM');
const increasebeats = document.getElementById('increase-bpm');
const reducebeats = document.getElementById('reduce-bpm');
const playBtn = document.getElementById('play')
const pauseBtn = document.getElementById('pause');
let count = 0;

slider.oninput = function(){
    BPM.innerHTML = this.value;
    updateMetroBPM();
}

increaseBPM.addEventListener('click', ()=>{
    if(parseInt(BPM.innerHTML) == 240){return}
    BPM.innerHTML = (parseInt(BPM.innerHTML) + 1).toString();
    slider.value = (parseInt(BPM.innerHTML) + 1).toString();
    updateMetroBPM();
})

reduceBPM.addEventListener('click', ()=>{
    if(parseInt(BPM.innerHTML) == 30){return}
    BPM.innerHTML = (parseInt(BPM.innerHTML) - 1).toString();
    slider.value = (parseInt(BPM.innerHTML) - 1).toString();
    updateMetroBPM();
})

increasebeats.addEventListener('click', ()=>{
    if(parseInt(beats.innerHTML) == 12){return}
    bpm.innerHTML = (parseInt(beats.innerHTML) + 1).toString();
    updateCircles();
    updateMetrobeats();
})

reducebeats.addEventListener('click', ()=>{
    if(parseInt(beats.innerHTML) == 1){return}
    bpm.innerHTML = (parseInt(beats.innerHTML) - 1).toString();
    updateCircles();
    updateMetrobeats();
})

playBtn.addEventListener('click', ()=>{
    playBtn.style.display = 'none';
    pauseBtn.style.display = 'flex';
    metronome.tempo = parseInt(BPM.innerHTML);
    metronome.start();
})

pauseBtn.addEventListener('click', ()=>{
    pauseBtn.style.display = 'none';
    playBtn.style.display = 'flex';
    metronome.stop();
})

window.onload =  function setSlider(){
    slider.value = 135;
    BPM.innerHTML = slider.value;
}

function updateMetroBPM(){
    const BPM = document.querySelector('.BPM');
    metronome.tempo = parseInt(BPM.innerHTML);
}

function updateMetrobeats(){
    const beats = document.querySelector('.bpm');
    metronome.beatsPerBar = parseInt(beats.innerHTML);
    metronome.currentBeatInBar = 0;
}

function updateCircles(){
    const beats = document.querySelector('.bpm');
    const circles = document.querySelector('.circles');
    circles.innerHTML = '';
    for(var i=0; i<parseInt(beats.innerHTML); i++){
        const circle = document.createElement('div');
        circle.className = 'circle';
        circles.appendChild(circle);
    }
}



