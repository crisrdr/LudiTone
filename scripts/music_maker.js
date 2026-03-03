/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const MusicMaker = {
  queue_: [],
  //player_: new Audio(),
  tone_: new Tone.Synth().toDestination(),
  queueSound: function (soundUrl) {
    this.queue_.push(soundUrl);
  },
  play: function () {
    const next = this.queue_.shift();
    if (next) {
      //this.player_.src = next;
      //this.player_.play();
    }
  },
  playSynth: function () {
    console.log(this.queue_);
    const part = new Tone.Part(((time, note) => {
      // the notes given as the second element in the array
      // will be passed in as the second argument
      this.tone_.triggerAttackRelease(note, "8n", time);
  }), [[0, "C2"], ["0:2", "C3"], ["0:3:2", "G2"]]).start(0);
    Tone.Transport.start();
  },
};

//In this case we call play only once, and that allows us to 
MusicMaker.player_.addEventListener('ended', MusicMaker.playSynth.bind(MusicMaker));

// This is the original listener, that allows recursively call to play
//MusicMaker.player_.addEventListener('ended', MusicMaker.play.bind(MusicMaker));
