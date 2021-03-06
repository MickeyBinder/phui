steal.plugins('phui/toolbar').then(function(){
	
	var J = Phui;
	$.Controller.extend("Phui.Shiftable",{listensTo: ["shift"]},
	{
        "li shift" : function(el){
			//move this guy to the first ... shift everything else around
			var el = $(el);
			if (el.index() == 0) {
				return el.trigger("shifted");
			}
			var parent =  el.parent();
			//move each child to the left off, and then back on
			var left = el.position().left
			
			var paddingLeft = parseInt( parent.css("paddingLeft") ,10)
			var marginLeft = parent.height()  ? 0 :  parseInt( el.css("marginLeft") ,10)
			//move me and right of me left
			var rights = el.add(el.nextAll())
			rights.animate({
				left: -(left-paddingLeft-marginLeft)+"px"
			},"slow")
			var done = false;
			//move left of me like we just flew off screen
			var prev = el.prevAll().animate({
				left: -(1000)+"px",
				opacity: 0},
			 {
				complete : function(){
					//now switch positions and show
					
					rights.css({"left": 0})
					
					parent.append(prev)
					prev.css({"left": 0, opacity: 1}).show();
					
					if(!done){
						done = true;
						el.trigger("shifted")
					}
					
					if($.browser.msie)
						// fix weird IE cleartype font bug
						$('li.button').each(function(){
							$(this).get(0).style.removeAttribute('filter');
						})
					
				}, duration: "slow"}
			)
			
			//move each child on the right, over
			
		}
	})
	
	$.Controller.extend("Phui.FadeInable",{
		listensTo: [">show:before",">hide:before"]
	}, {
	   ">show:before" : function(el, ev){
			ev.preventDefault();
			this.element.css("opacity",0.2).show().animate({opacity: 1.0},"slow", function(){
				el.trigger("show:after")
			})
	   },
       ">hide:before" : function(el, ev){
		   var e = this.element;
		   ev.preventDefault();
		   this.element.animate({opacity: 0.2},"slow", function(){ 
		   		el.hide()
		   		el.trigger("hide:after")
			});
   		}
	})
	
	
	J.Menu({
        types: [J.Positionable({my: "left top", at : "right top"}), Phui.Shiftable, J.FadeInable, Phui.Highlight],
		class_names: "menu",
		apply_types_to_top : true
    }).extend("ClickMenu",{
		init: function(){
			this.listensTo.push('shifted');
			this._super(arguments)
		}
	},{
		init : function(){
			this.element.hide();
			this._super.apply(this,arguments)
		},
		"li select:before" : function(el, ev){
			ev.preventDefault();
			$(el).addClass("selected").removeClass("deselected").trigger("shift")
		},
		calculateSubmenuPosition : function(el, ev){
			var off = this.element.offset();
			off.left += 40;
			off.height += this.element.outerHeight()
			return off;
		},
		"li shifted" : function(el){
			el.trigger("select:after");
			el.siblings().removeClass("selected").addClass("deselected")
		},
		"hide:after" : function(el){
			this.element.find("li").removeClass("selected").removeClass("deselected")
		},
		">hide:before" : function(el, ev){},
		">show:before" : function(el, ev){},
		">hide": function(){} // TODO figure out the right way to make hide appear to be triggered
	})
	//({menu_type: ClickMenu})
	J.Toolbar({menu_type: ClickMenu, child_class_names: "menu"}).extend("Phui.Navigation",{listensTo: ["shifted"]},{
		init : function(){
			this._super.apply(this, arguments)
			this.element.mixin(Phui.Shiftable, Phui.Highlight)
            this.element.children("ul").css("position","relative")
		},
		"li select:before" : function(el, ev){
			ev.preventDefault();
			this.find("."+this.options.active+":first").removeClass(this.options.active);
			$(el).removeClass("deselected").addClass("selected").trigger("shift");
		},
		calculateSubmenuPosition : function(el, ev){
	   		var off = this.element.offset();
			off.left += 20;
			off.top += (35)
			return off;
	   },
	   "li shifted" : function(el, ev){
			el.trigger("select:after");
			el.siblings().removeClass("selected").addClass("deselected");
			el.addClass("selected").removeClass("deselected");
	   }
	})
	
});