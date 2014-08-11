// This is a fork of Instant Webcam (c) Dominic Szablewski - PhobosLab.org
// Please note for proof of concept only

var InstaCam = function() {

	var self = this;

	var canvas = document.getElementById('videoCanvas');
	var notice = document.getElementById('notice');
	var noticeText = document.getElementById('noticeText');

	this.player = null;
	this.client = null;

	var reconnectInProgress = false;

	// ------------------------------------------------------
	// Initial connecting and retry

	this.connect = function(address) {
		reconnectInProgress = false;
		
		if( this.client && this.client.readyState == this.client.OPEN ) { return; }
		
		if( this.player ) { this.player.stop(); this.player = null; }
		if( this.client ) { this.client.close(); this.client = null; }

		this.client = new WebSocket(address);
		this.player = new jsmpeg(this.client, { canvas: canvas });

		this.client.addEventListener('close', function(){}, false);
		this.client.addEventListener('error', attemptReconnect, false);

		setTimeout(function(){
			if( !this.client || this.client.readyState != this.client.OPEN ) {
				attemptReconnect();
			}
		}, 1000);
		
		// Hide notice when connected
		this.client.addEventListener('open', function(){
			self.setNotice(null); 
		}, false);
	};

	this.setNotice = function( msg ) {
		if( !msg ) {
			notice.style.display = 'none';
		}
		else {
			notice.style.display = 'block';
			noticeText.innerHTML = msg;
		}
	};

	var attemptReconnect = function(event) {
		
		if( reconnectInProgress ) { return; }
		
		setTimeout(self.connect(), 1000);
		reconnectInProgress = true;
	};


	// ------------------------------------------------------
	// Init!

	if( navigator.userAgent.match(/iPhone|iPod|iPad|iOS/i) ) {
		// Don't show recording button on iOS devices. Desktop browsers unable
		// of recording, will see a message when the record button is clicked.
		document.getElementById('record').style.display = 'none';
	}

	if( !window.WebSocket ) {
		setNotice("Your Browser doesn't Support WebSockets. Please use Firefox, Chrome, Safari or IE10");
	}

};
