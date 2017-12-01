(function() {

    window.CanvasSlideshow = function( options ) {



      //  SCOPE
      /// ---------------------------
      var that  =   this;



      //  OPTIONS
      /// ---------------------------
      options                     = options || {};
      options.pixiSprites         = options.hasOwnProperty('sprites') ? options.sprites : [];
      options.centerSprites       = options.hasOwnProperty('centerSprites') ? options.centerSprites : false;
      options.texts               = options.hasOwnProperty('texts') ? options.texts : [];
      options.autoPlay            = options.hasOwnProperty('autoPlay') ? options.autoPlay : true;
      options.autoPlaySpeed       = options.hasOwnProperty('autoPlaySpeed') ? options.autoPlaySpeed : [10, 3];
      options.fullScreen          = options.hasOwnProperty('fullScreen') ? options.fullScreen : true;
      options.displaceScale       = options.hasOwnProperty('displaceScale') ? options.displaceScale : [200, 70];
      options.displacementImage   = options.hasOwnProperty('displacementImage') ? options.displacementImage : '';
      options.navElement          = options.hasOwnProperty('navElement')  ?  options.navElement : document.querySelectorAll( '.scene-nav' );
      options.displaceAutoFit     = options.hasOwnProperty('displaceAutoFit')  ?  options.displaceAutoFit : false;
      options.wacky               = options.hasOwnProperty('wacky') ? options.wacky : false;
      options.interactive         = options.hasOwnProperty('interactive') ? options.interactive : false;
      options.interactionEvent    = options.hasOwnProperty('interactionEvent') ? options.interactionEvent : '';
      options.displaceScaleTo     = ( options.autoPlay === false ) ? [ 0, 0 ] : [ 20, 20 ];
      options.textColor           = options.hasOwnProperty('textColor') ? options.textColor : '#fff';
      options.displacementCenter  = options.hasOwnProperty('displacementCenter') ? options.displacementCenter : false;
      options.dispatchPointerOver = options.hasOwnProperty('dispatchPointerOver') ? options.dispatchPointerOver : false;



      //  PIXI VARIABLES
      /// ---------------------------
      var renderer            = new PIXI.autoDetectRenderer( window.innerWidth, window.innerHeight, { transparent: true });
      var stage               = new PIXI.Container();
      var slidesContainer     = new PIXI.Container();
      var displacementSprite  = new PIXI.Sprite.fromImage( options.displacementImage );
      var displacementFilter  = new PIXI.filters.DisplacementFilter( displacementSprite );



      //  TEXTS
      /// ---------------------------
      var style = new PIXI.TextStyle({
        fill: options.textColor,
        wordWrap: true,
        wordWrapWidth: 400,
        letterSpacing: 20,
        fontSize: 14
      });



      //  SLIDES ARRAY INDEX
      /// ---------------------------
      this.currentIndex = 0;



      /// ---------------------------
      //  INITIALISE PIXI
      /// ---------------------------
      this.initPixi = function() {

        // Add canvas to the HTML
        var rippleCanvasContainer = document.getElementById('ripple-canvas-container');
        renderer.view.id = 'ripple-canvas';
        renderer.autoResize = true;
        rippleCanvasContainer.appendChild(renderer.view);

        // Add child container to the main container
        stage.addChild( slidesContainer );

        // Enable Interactions
        stage.interactive = true;

        displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;


        // Set the filter to stage and set some default values for the animation
        stage.filters = [displacementFilter];

        if ( options.autoPlay === false ) {
          displacementFilter.scale.x = 0;
          displacementFilter.scale.y = 0;
        }

        if ( options.wacky === true ) {

          displacementSprite.anchor.set(0.5);
          displacementSprite.x = renderer.width / 2;
          displacementSprite.y = renderer.height / 2;
        }

        displacementSprite.scale.x = 2;
        displacementSprite.scale.y = 2;

        // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
        displacementFilter.autoFit = options.displaceAutoFit;

        stage.addChild( displacementSprite );

      };



      /// ---------------------------
      //  LOAD SLIDES TO CANVAS
      /// ---------------------------
      this.loadPixiSprites = function( sprites ) {


        var rSprites = options.sprites;
        var rTexts   = options.texts;

        for ( var i = 0; i < rSprites.length; i++ ) {

          var texture   = new PIXI.Texture.fromImage( sprites[i] );
          var image     = new PIXI.Sprite( texture );

          if ( rTexts ) {
            var richText = new PIXI.Text( rTexts[i], style);
            image.addChild(richText);

            richText.anchor.set(0.5);
            richText.x = image.width / 2;
            richText.y = image.height / 2;
          }

          if ( options.centerSprites === true ) {
            image.anchor.set(0.5);
            image.x = renderer.width / 2;
            image.y = renderer.height / 2;
          }
          // image.transform.scale.x = 1.3;
          // image.transform.scale.y = 1.3;



          if ( i !== 0  ) {
            TweenMax.set( image, { alpha: 0 } );
          }

          slidesContainer.addChild( image );

        }

      };



      /// ---------------------------
      //  DEFAULT RENDER/ANIMATION
      /// ---------------------------
      if ( options.autoPlay === true ) {

        var ticker = new PIXI.ticker.Ticker();

        ticker.autoStart = options.autoPlay;

        ticker.add(function( delta ) {

          displacementSprite.x += options.autoPlaySpeed[0] * delta;
          displacementSprite.y += options.autoPlaySpeed[1];

          renderer.render( stage );

        });

      }  else {

          var render = new PIXI.ticker.Ticker();

          render.autoStart = true;

          render.add(function( delta ) {
            renderer.render( stage );
          });

      }


      /// ---------------------------
      //  TRANSITION BETWEEN SLIDES
      /// ---------------------------
      var isPlaying   = false;
      var slideImages = slidesContainer.children;
      this.moveSlider = function( newIndex ) {

        isPlaying = true;


        var baseTimeline = new TimelineMax( { onComplete: function () {
          that.currentIndex = newIndex;
          isPlaying = false;
          if ( options.wacky === true ) {
            displacementSprite.scale.set( 1 );
          }
         },onUpdate: function() {

            if ( options.wacky === true ) {
              displacementSprite.rotation += baseTimeline.progress() * 0.02;
              displacementSprite.scale.set( baseTimeline.progress() * 3 );
            }

        } });

        baseTimeline.clear();

        if ( baseTimeline.isActive() ) {
          return;
        }

        // DEMO 4
        baseTimeline
        .to(displacementFilter.scale, 0.8, { x: options.displaceScale[0], y: options.displaceScale[1], ease: Power2.easeIn  })
        .to(slideImages[that.currentIndex], 0.5, { alpha: 0, ease: Power2.easeOut }, 0.4)
        .to(slideImages[newIndex], 0.8, { alpha: 1, ease: Power2.easeOut }, 1)
        .to(displacementFilter.scale, 0.7, { x: options.displaceScaleTo[0], y: options.displaceScaleTo[1], ease: Power1.easeOut }, 0.9 );

      };



      /// ---------------------------
      //  CLICK HANDLERS
      /// ---------------------------
      var nav = options.navElement;

      for ( var i = 0; i < nav.length; i++ ) {

        var navItem = nav[i];

        navItem.onclick = function( event ) {

          // Make sure the previous transition has ended
          if ( isPlaying ) {
            return false;
          }

          if ( this.getAttribute('data-nav') === 'next' ) {

            if ( that.currentIndex >= 0 && that.currentIndex < slideImages.length - 1 ) {
              that.moveSlider( that.currentIndex + 1 );
            } else {
              that.moveSlider( 0 );
            }

          } else {

            if ( that.currentIndex > 0 && that.currentIndex < slideImages.length ) {
              that.moveSlider( that.currentIndex - 1 );
            } else {
              that.moveSlider( spriteImages.length - 1 );
            }

          }

          return false;

        }

      }



      /// ---------------------------
      //  INIT FUNCTIONS
      /// ---------------------------

      this.init = function() {


        that.initPixi();
        that.loadPixiSprites( options.pixiSprites );
        window.addEventListener('resize', function () {
          renderer.resize(window.innerWidth, window.innerHeight);
        });
      };

      /// ---------------------------
      //  INTERACTIONS
      /// ---------------------------
      function rotateSpite() {
        displacementSprite.rotation += 0.001;
        rafID = requestAnimationFrame( rotateSpite );
      }

      if ( options.interactive === true ) {

        var rafID, mouseX, mouseY;

        // Enable interactions on our slider
        slidesContainer.interactive = true;
        slidesContainer.buttonMode  = true;

        // HOVER
        if ( options.interactionEvent === 'hover' || options.interactionEvent === 'both'  )  {

          slidesContainer.pointerover = function( mouseData ){
            mouseX = mouseData.data.global.x;
            mouseY = mouseData.data.global.y;
            TweenMax.to( displacementFilter.scale, 1, { x: "+=" + Math.sin( mouseX ) * 100 + "", y: "+=" + Math.cos( mouseY ) * 100 + ""  });
            rotateSpite();
          };

          slidesContainer.pointerout = function( mouseData ){
            TweenMax.to( displacementFilter.scale, 1, { x: 0, y: 0 });
            cancelAnimationFrame( rafID );
          };

        }

        // CLICK
        if ( options.interactionEvent === 'click' || options.interactionEvent === 'both'  ) {

          slidesContainer.pointerup = function( mouseData ){
            if ( options.dispatchPointerOver === true ) {
              TweenMax.to( displacementFilter.scale, 1, { x: 0, y: 0, onComplete: function() {
                TweenMax.to( displacementFilter.scale, 1, { x: 20, y: 20  });
              } });
            } else {
              TweenMax.to( displacementFilter.scale, 1, { x: 0, y: 0 });
              cancelAnimationFrame( rafID );
            }

          };

          slidesContainer.pointerdown = function( mouseData ){
            mouseX = mouseData.data.global.x;
            mouseY = mouseData.data.global.y;
            TweenMax.to( displacementFilter.scale, 1, { x: "+=" + Math.sin( mouseX ) * 1200 + "", y: "+=" + Math.cos( mouseY ) * 200 + ""  });
          };

        }

      }


      /// ---------------------------
      //  CENTER DISPLACEMENT
      /// ---------------------------
      if ( options.displacementCenter === true ) {
        displacementSprite.anchor.set(0.5);
        displacementSprite.x = renderer.view.width / 2;
        displacementSprite.y = renderer.view.height / 2;
      }


      /// ---------------------------
      //  START
      /// ---------------------------
      this.init();
    };

  })();
