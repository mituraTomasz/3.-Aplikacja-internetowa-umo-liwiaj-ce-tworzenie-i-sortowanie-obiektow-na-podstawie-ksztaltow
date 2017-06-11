window.onload = function() {
    
    (function buttonsHandle(){
        
        $("button[data-draw]").click(function() {
            var dataAttrName = $(this).data('draw');
            Draw[dataAttrName]();
        });
        $("button[data-execute]").click(function() {
            Canvas.startDetecting();
            FigureStrategy.resetCount();
            Diary.show();
            paper.project.activeLayer.removeChildren();//clear canvas
        });
        
    })();

    
    var Draw = (function() {
        var tool = new paper.Tool();
        return {
            circle : function() {
                tool.onMouseDown = function(event) {  
                    
                    var mouseDownPoint = event.downPoint;
                    tool.onMouseUp = function(event) {

                        var mouseUpPoint = event.point;
                        var circle = new paper.Path.Circle( mouseUpPoint, mouseDownPoint.getDistance(mouseUpPoint) );
                        circle.strokeColor = 'black';
                        circle.fillColor = 'black';
                    }
                }
            },
            triangle : function(){
                tool.onMouseDown = function(event) {  
                    var mouseDownPoint = event.downPoint;

                    tool.onMouseUp = function() {
                        var mouseUpPoint = event.point;

                        var center = new paper.Point(mouseDownPoint);
                        var sides = 3;
                        var radius = mouseDownPoint.getDistance(mouseUpPoint);
                        var triangle = new paper.Path.RegularPolygon(center, sides, radius);
                        triangle.fillColor = 'black';

                    };
                }
            },
            rectangle : function() {
                 tool.onMouseDown = function(event) {  
                    var mouseDownPoint = event.downPoint;

                    tool.onMouseUp = function() {
                        var mouseUpPoint = event.point;

                        var from = new paper.Point(mouseDownPoint);
                        var to = new paper.Point(mouseUpPoint);
                        var rectangle = new paper.Path.Rectangle(from, to);
                        rectangle.strokeColor = 'black';
                        rectangle.fillColor = 'black';

                    };
                }
            }
        }
    })();    

    var Diary = (function() {
        var Diary = '';
        return {
            add: function(msg) {
                Diary += msg + '\n';
            },
            show: function() {
                if (Diary === '') alert('Brak figur!'); 
                else alert(Diary);
                Diary = '';
            }
        }
    })();
    
    var ArrayOperations = {
        
        listToMatrix: function(list, elementsPerSubArray) {
            var matrix = [], i, k;

            for (i = 0, k = -1; i < list.length; i++) {
                if (i % elementsPerSubArray === 0) {
                    k++;
                    matrix[k] = [];
                }

                matrix[k].push(list[i]);
            }

            return matrix;
        },
        transposeMatrix: function(arr) {  
            var k = arr.length;  
            var l = arr[0].length;  
            var arr1 = [];  
            var arr2 = [];  
            for (var j = 0; j < l; j++) {  
                arr1 = [];  
                for (var i = 0; i < k; i++) {  
                    arr1.push(arr[i][j]);  
                }  
                arr2.push(arr1);  
            }  
            return arr2;  
        },
        pixelDataTo2dArray: function(imgData, canvasWidth) {
            var r, g, b, a,
                data = imgData.data, 
                detectedColorArr = [];

            for (var i = 0, max = data.length; i < max; i += 4) {
                r = imgData.data[i];
                g = imgData.data[i+1];
                b = imgData.data[i+2];
                a = imgData.data[i+3];

                if ( !( r == 0 && g == 0 && b == 0 && a == 0 ) ) {
                    detectedColorArr.push(1);
                } else {
                    detectedColorArr.push(0);
                } 

            }

            return this.transposeMatrix( this.listToMatrix( detectedColorArr, canvasWidth ) );
        }
        
    }

    var FigureArea = (function() {
        var xLength,
            yLength,
            catchedI,
            catchedJ,
            pixels,
            constr;
        
        constr = function(catchedI, catchedJ, pixels) {
            this.pixels = pixels;
            this.catchedI = catchedI;
            this.catchedJ = catchedJ;
            
            
            //badanie xLength
            var horizontalLength = 0;
            while ( pixels[catchedI + horizontalLength][catchedJ] === 1 ) {
                ++horizontalLength;
            }
            
            //badanie yLength
            var verticalLength = 0,
                posOfXLengthCenter = catchedI + (horizontalLength / 2);
            
            if ( horizontalLength % 2 !== 0 ) posOfXLengthCenter = Math.floor(posOfXLengthCenter);
            while ( pixels[posOfXLengthCenter][catchedJ + verticalLength] === 1 ) {
                ++verticalLength;
            }
            
            this.xLength = horizontalLength;
            this.yLength = verticalLength
        }
        
        return constr;
    })();
    
    var Figure = (function() {
        var constr,
            xLength,
            yLength;
        
        constr = function(figureArea) {    
            this.xLength = {
                top: (function(){
                    var atTop = 0;
                    while ( figureArea.pixels[figureArea.catchedI + atTop][figureArea.catchedJ] === 1 ) {
                        ++atTop;
                    }
                    return atTop;
                })(),
                middle: (function(){
                    var atMiddle = 0,
                        posOfXLengthCenter = figureArea.catchedI + Math.floor(figureArea.xLength / 2),
                        oddLengthFix = (figureArea.xLength % 2) === 1 ? 1: 0;
                    
                    while ( figureArea.pixels[posOfXLengthCenter + atMiddle + 1][ figureArea.catchedJ + Math.floor( figureArea.yLength / 2 ) ] )  {
                        ++atMiddle;
                    }
                    
                    return (atMiddle * 2) - oddLengthFix;
                })(),
                base: (function(){
                    var atBase = 0,
                        posOfXLengthCenter = figureArea.catchedI + Math.floor(figureArea.xLength / 2),
                        oddLengthFix = (figureArea.xLength % 2) === 1 ? 1: 0;
                    
                    while ( figureArea.pixels[posOfXLengthCenter + atBase][figureArea.catchedJ + figureArea.yLength - 1 ] ) {
                        ++atBase;
                    }
                    
                    return (atBase * 2) - oddLengthFix;
                })()
            };
            this.yLength = figureArea.yLength;
        }
        
        constr.prototype = {
            recognizeFigure: function() {
                var figureType;
                
//                alert('top ' + this.xLength.top +  ', middle ' +  this.xLength.middle + ', base ' + this.xLength.base);
                
                if ( this.xLength.top === this.xLength.base && this.xLength.top === this.xLength.middle ) figureType = 'rectangle';
                else if ( this.xLength.top < this.xLength.base ) figureType = 'triangle';
                else figureType = 'circle';
                return figureType;
            },
            getWidestXLine: function() {
                return Math.max(this.xLength.top, this.xLength.middle, this.xLength.base );
            }
        }
        
        return constr;
    })();
    
    var Rectangle = (function() {
        var constr,
            a,
            b;
        
        constr = function(figure) {
            this.a = figure.xLength.base;
            this.b = figure.yLength;
        }
        constr.prototype = {
            getArea: function() {
                return this.a * this.b;
            },
            getPerimeter: function() {
                return 2 * (this.a + this.b);
            }
        }
        return constr;
    })();
    var Triangle = (function() {
        var constr,
            a,
            h
        
        constr = function(figure) {
            this.a = figure.xLength.base;
            this.h = figure.yLength;
        }
        constr.prototype = {
            getArea: function() {
                return (this.a * this.h) / 2;
            },
            getPerimeter: function() {
                return this.a * 3;
            }
        }
        return constr;
    })();
    var Circle = (function() {
        var constr,
            r
            
        constr = function(figure) {
            this.r = figure.yLength / 2;
        }
        constr.prototype = {
            getArea: function() {
                return Math.floor( Math.PI * Math.pow(this.r, 2) );
            },
            getPerimeter: function() {
                return Math.floor( 2 * Math.PI * this.r );
            }
        }
        return constr;
    })();
    
    var FigureStrategy = (function() {
        var me = {},
            count = 0,
            figures = {};
            
        figures.rectangle = function(figure) {
            var rectangle = new Rectangle(figure)
            return 'Figura nr ' + count + ' jest kwadratem o parametrach: ' + 
                'a = ' + rectangle.a +
                ', b = ' + rectangle.b +
                ', pole = ' + rectangle.getArea() +
                ', obwod = ' + rectangle.getPerimeter();
        }
        figures.triangle = function(figure) {
            var triangle = new Triangle(figure)
            return 'Figura nr ' + count + ' jest trojkatem o parametrach: ' + 
                'a = ' + triangle.a +
                ', h = ' + triangle.h +
                ', pole = ' + triangle.getArea() +
                ', obwod = ' + triangle.getPerimeter();
        }
        figures.circle = function(figure) {
            var circle = new Circle(figure)
            return 'Figura nr ' + count + ' jest kolem o parametrach: ' + 
                'a = ' + circle.r +
                ', pole = ' + circle.getArea() +
                ', obwod = ' + circle.getPerimeter();
        }
        
        me.resetCount = function() {
            count = 0;
        }
        me.getDetails = function(figure) {
            var type = figure.recognizeFigure();
            if ( !figures[type] ) {
                console.log('brak instrukcji dla ' + type);
                return 0;
            }
            ++count;
            return figures[type](figure);
        }
        
        return me;
    })();
        
    var Canvas = (function() {
        var canvas = document.getElementById('canvas'),
            ctx = canvas.getContext('2d'),
            imgData,
            pixels,
            reaload = function() {
                imgData = ctx.getImageData( 0, 0, canvas.width, canvas.height );
                pixels = ArrayOperations.pixelDataTo2dArray(imgData, canvas.width);
            }
            
        //Start canvas 
        paper.setup(canvas);
        paper.view.draw();
        reaload();

        return {
            clearArea: function(figureArea) {
                
                var figureTmp = new Figure(figureArea);
                ctx.clearRect(
                    figureArea.catchedI + (figureArea.xLength / 2) - 1 - (figureTmp.getWidestXLine() / 2),
                    figureArea.catchedJ - 1,
                    figureTmp.getWidestXLine() + 2,
                    figureArea.yLength + 2
                );
            
            },
            startDetecting: function() {
                reaload();
                
                for (var j = 0, maxJ = pixels[0].length; j < maxJ; ++j) {
                    for (var i = 0, maxI = pixels.length; i < maxI; ++i){
                        if (pixels[i][j] == 1) {
                            
                            Diary.add( FigureStrategy.getDetails( new Figure( new FigureArea(i, j, pixels) ) ) );                            
                            this.clearArea( new FigureArea(i, j, pixels)  );
                            reaload();
                        }  
                    }
                }
            }
            
        }
    })();
}











