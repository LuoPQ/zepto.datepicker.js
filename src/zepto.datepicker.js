/**
 * zepto.datepicker.js v0.1.0
 * MIT License
 * author info pls visit: http://luopq.com
 * for more info pls visit: https://github.com/LuoPQ/zepto.datepicker.js
 */
; (function ($, window, document, undefined) {

    //#region Date扩展

    //添加指定单位的时间
    Date.prototype.dateAdd = function (interval, number) {
        var d = new Date(this);
        var k = { 'y': 'FullYear', 'q': 'Month', 'm': 'Month', 'w': 'Date', 'd': 'Date', 'h': 'Hours', 'n': 'Minutes', 's': 'Seconds', 'ms': 'MilliSeconds' };
        var n = { 'q': 3, 'w': 7 };
        eval('d.set' + k[interval] + '(d.get' + k[interval] + '()+' + ((n[interval] || 1) * number) + ')');
        return d;
    }

    //计算当前日期与指定日期相差的天数
    Date.prototype.dateDiff = function (otherDate) {
        return (this.getTime() - otherDate.getTime()) / 1000 / 60 / 60 / 24;
    };
    Date.prototype.format = function () {
        var month = this.getMonth() + 1;
        var date = this.getDate();
        month < 10 && (month = "0" + month);
        date < 10 && (date = "0" + date);

        return [this.getFullYear(), month, date].join("-");
    };
    Date.parse = function (s) {
        if ((s || '') == '')
            return null;

        if (typeof (s) == "object")
            return s;

        if (typeof (s) == 'string') {
            if (/\/Date\(.*\)\//gi.test(s)) {
                return eval(s.replace(/\/Date\((.*?)\)\//gi, "new Date($1)"));
            }
            else if (/(\d{8})/.test(s)) {
                return eval(s.replace(/(\d{4})(\d{2})(\d{2})/, "new Date($1,parseInt($2)-1,$3)"));
            }
            else if (/(\d{4})[-/](\d{1,2})[-/](\d{1,2})[T\s](\d{1,2})\:(\d{1,2})(?:\:(\d{1,2}))?/.test(s)) {
                return eval(s.replace(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})[T\s](\d{1,2})\:(\d{1,2})(?:\:(\d{1,2}))?[\w\W]*/, "new Date($1,parseInt($2)-1,parseInt($3),parseInt($4),parseInt($5),parseInt($6)||0)"));
            }
            else if (/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.test(s)) {
                return eval(s.replace(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/, "new Date($1,parseInt($2)-1,$3)"));
            }
            try {
                return new Date(s);
            } catch (e) {
                return null;
            }
        }

        return null;
    };
    Date.prototype.equal = function (otherDate) {

        return this.getFullYear() == otherDate.getFullYear()
            && this.getMonth() == otherDate.getMonth()
            && this.getDate() == otherDate.getDate();
    }
    //#endregion


    $.fn.setTranslate3d = function (x, y, z) {
        return this.each(function () {
            $(this).css({
                "transform": "translate3d(" + x + "," + y + "," + z + ")"
            });
        })
    }

    var PickerTypes = {
        year: {},
        month: {},
        date: {}
    };

    var SwipeDirections = {
        left: -1,
        right: 1,
        none: 0
    }

    function Year(year, disabled) {
        this.year = year;
        this.disabled = disabled;
    }

    function Month(month) {
        this.month = month;
        this.monthText = (month + 1) + "月";
    }

    function DateClass(date, disabled) {
        this.date = date;
        this.dateText = this.date.equal(new Date()) ? "今天" : date.getDate();
        this.fullDateText = this.date.format("yyyy-MM-dd");
        this.disabled = disabled;
    }

    function DatePicker($ele, options) {
        this.$ele = $ele;
        this.options = options;
        this.$container = null;
        this.$mask = null;
        this.$dateBody = null;
        this.$btnYear = null;
        this.$btnPrevYear = null;
        this.$btnNextYear = null;
        this.$btnMonth = null;
        this.$btnPrevMonth = null;
        this.$btnNextMonth = null;

        this.currentDate = Date.parse(options.currentDate || new Date());
        this.currentYear = this.currentDate.getFullYear();
        this.currentMonth = this.currentDate.getMonth();
        this.minYear = parseInt((this.currentYear - this.currentYear % 10) / 100) * 100 - 91;
        this.maxYear = this.minYear + 181;
        this.currentSelectYear = this.currentYear;
        this.startX = 0;
        this.startTime = null;

        this.init();

    }
    DatePicker.prototype = {
        winWidth: screen.width,
        boundary: this.winWidth / 6,
        init: function () {
            this.pickerType = PickerTypes.date;
            this.$ele.attr("readonly", "readonly");
            this.renderContainer(this.currentYear, this.currentMonth);
            this.renderDate(this.currentYear);
            this.bindEvent();
        },
        renderContainer: function (year, month) {
            var html = "";

            html += '<div class="dp-mask"></div>';
            html += '<div class="dp-panel">';
            html += '   <div class="dp-head">';
            html += '       <div class="dp-select-box">';
            html += '           <a href="javascript:void(0);" class="dp-prev btnPrevYear">&lt;</a>';
            html += '           <a href="javascript:void(0);" class="dp-head-text btnYear">' + year + '</a>';
            html += '           <a href="javascript:void(0);" class="dp-next btnNextYear">&gt;</a>';
            html += '       </div>';
            html += '       <div class="dp-select-box">';
            html += '           <a href="javascript:void(0);" class="dp-prev btnPrevMonth">&lt;</a>';
            html += '           <a href="javascript:void(0);" class="dp-head-text btnMonth">' + (month + 1) + '月</a>';
            html += '           <a href="javascript:void(0);" class="dp-next btnNextMonth">&gt;</a>';
            html += '       </div>';
            html += '   </div>';
            html += '   <div class="dp-body flex-start">';
            html += '   </div>';
            html += '</div>';

            this.$container = $(html);
            this.$mask = this.$container.eq(0);
            this.$dateBody = this.$container.find(".dp-body");
            this.$btnYear = this.$container.find(".btnYear");
            this.$btnPrevYear = this.$container.find(".btnPrevYear");
            this.$btnNextYear = this.$container.find(".btnNextYear");
            this.$btnMonth = this.$container.find(".btnMonth");
            this.$btnPrevMonth = this.$container.find(".btnPrevMonth");
            this.$btnNextMonth = this.$container.find(".btnNextMonth");

            $(document.body).append(this.$container);
        },
        renderYear: function () {
            var html = "";

            for (var startYear = this.minYear + 90, endYear = startYear + 21; startYear < endYear; startYear = startYear + 10) {
                html += this.createYearHtml(startYear);
            }

            this.$dateBody.html(html).css({
                "width": this.winWidth * 3
            }).setTranslate3d(-this.winWidth + "px", 0, 0);

            this.pickerType = PickerTypes.year;

        },
        renderMonth: function () {
            var html = '<ul class="dp-month">';

            for (var i = 0; i < 12; i++) {
                html += '<li data-month="' + i + '" class="' + (i == this.currentMonth ? 'select' : '') + '">' + (i + 1) + '月</li>';
            }

            html += '</ul>';

            this.$dateBody.html(html).css({
                "width": this.winWidth
            }).setTranslate3d(0, 0, 0);

            this.pickerType = PickerTypes.month;

        },
        renderDate: function (year) {

            var html = '';
            var startMonth = this.currentMonth - 1;
            var endMonth = this.currentMonth + 1;
            for (var month = startMonth; month <= endMonth; month++) {
                html += this.createDateHtml(year, month);
            }

            this.$dateBody.html(html).css({
                "width": this.winWidth * 3
            }).setTranslate3d(-this.winWidth + "px", 0, 0);

            this.pickerType = PickerTypes.date;
        },
        createYearHtml: function (startYear) {

            var html = "";

            html += ' <ul class="dp-year">';
            var years = this.createYears(startYear);
            for (var i = 0, length = years.length; i < length; i++) {

                if (years[i].year == this.currentYear) {
                    html += '<li data-year="' + years[i].year + '" class="select">' + years[i].year + '</li>';
                }
                else if (years[i].disabled) {
                    html += '<li data-year="' + years[i].year + '" class="disabled">' + years[i].year + '</li>';
                }
                else {
                    html += '<li data-year="' + years[i].year + '">' + years[i].year + '</li>';
                }
            }
            html += '</ul>';

            return html;
        },
        createDateHtml: function (year, month) {
            var weekName = ["日", "一", "二", "三", "四", "五", "六"];
            var html = "";
            html += '<div class="dp-date-box">';

            //#region 星期
            html += '<ul class="dp-week">';
            for (var weekIndex = 0, length = weekName.length; weekIndex < length; weekIndex++) {
                html += '<li>' + weekName[weekIndex] + '</li>';
            }
            html += '</ul>';
            //#endregion

            //#region 日期
            var dates = this.createDates(year, month);

            html += '<ul class="dp-date">';
            for (var i = 0, length = dates.length; i < length; i++) {
                var classNames = "";
                if (dates[i].date.equal(this.currentDate)) {
                    classNames = " select";
                }
                if (dates[i].disabled) {
                    classNames += " disabled";
                }

                html += '<li data-date="' + dates[i].fullDateText + '" class="' + classNames + '">' + dates[i].dateText + '</li>';

            }
            html += '</ul>';

            //#endregion

            html += '</div>';

            return html;
        },
        createYears: function (startYear) {

            var years = [];
            for (var i = 0; i < 12; i++) {
                var year = startYear + i;
                years.push(new Year(year, year < this.minYear || year > this.maxYear));
            }

            return years;
        },
        createDates: function (year, month) {
            var firstDay = new Date(year, month, 1);
            var lastDay = new Date(year, month + 1, 0);
            var list = [];

            for (var i = 0, length = firstDay.getDay() ; i < length ; i++) {
                var date = firstDay.dateAdd("d", i - length);

                list.push(new DateClass(date, this.isDateDisabled(date, month)));
            }

            for (var i = 1; i <= lastDay.getDate() ; i++) {
                var date = new Date(year, month, i);
                list.push(new DateClass(date, this.isDateDisabled(date, month)));
            }

            for (var i = 0; i < 6 - lastDay.getDay() ; i++) {
                var date = new Date(year, month + 1, i + 1);

                list.push(new DateClass(date, this.isDateDisabled(date, month)));
            }
            return list;
        },
        bindEvent: function () {
            var self = this;
            self.$ele.on("click", function () {
                self.show();
            });
            self.$mask.on("click", function () {
                self.hide();
            })
            self.$dateBody.on({
                "touchstart": function (event) {

                    self.startX = window.Zepto ? event.touches[0].pageX : event.originalEvent.touches[0].pageX;
                    self.offsetX = 0;
                    self.startTime = new Date() + 1;
                },
                "touchmove": function (event) {
                    switch (self.pickerType) {
                        case PickerTypes.month:
                            return;
                        default:
                            event.preventDefault();
                            self.offsetX = (window.Zepto ? event.touches[0].pageX : event.originalEvent.touches[0].pageX) - self.startX;
                            self.$dateBody.setTranslate3d(-self.winWidth + self.offsetX + "px", 0, 0);
                    }

                },
                "touchend": function (event) {

                    if (Math.abs(self.offsetX) > 0) {
                        if (self.pickerType == PickerTypes.month) {
                            return;
                        }

                        var startTime = self.startTime;
                        var endTime = new Date() + 1;
                        var offsetX = self.offsetX;
                        var boundary = self.boundary;

                        if (self.pickerType == PickerTypes.date) {

                            if (endTime - startTime >= 800) {
                                if (offsetX >= boundary) {
                                    self.goDates(self.currentMonth - 1);
                                }
                                else if (offsetX < -boundary) {
                                    self.goDates(self.currentMonth + 1);
                                }
                                else {
                                    self.goDates(self.currentMonth);
                                }
                            }
                            else {
                                if (offsetX >= 50) {
                                    self.goDates(self.currentMonth - 1);
                                }
                                else if (offsetX < -50) {
                                    self.goDates(self.currentMonth + 1);
                                }
                                else {
                                    self.goDates(self.currentMonth);
                                }
                            }
                        }
                        else if (self.pickerType == PickerTypes.year) {
                            if (endTime - startTime >= 800) {
                                if (offsetX >= boundary) {
                                    self.goYears(SwipeDirections.right);
                                }
                                else if (offsetX < -boundary) {
                                    self.goYears(SwipeDirections.left);
                                }
                                else {
                                    self.goYears(SwipeDirections.none);
                                }
                            }
                            else {
                                if (offsetX >= 50) {
                                    self.goYears(SwipeDirections.right);
                                }
                                else if (offsetX < -50) {
                                    self.goYears(SwipeDirections.left);
                                }
                                else {
                                    self.goYears(SwipeDirections.none);
                                }
                            }
                        }
                    }
                    else {
                        var $target = $(event.target);
                        if ($target.hasClass("disabled")) {
                            return;
                        }
                        switch (self.pickerType) {
                            case PickerTypes.date:
                                var date = $target.data("date");
                                if (date) {
                                    self.$ele.val(date);
                                    self.$dateBody.find(".select").removeClass("select")
                                    $target.addClass("select");
                                    self.hide();
                                    self.options.onDateSelected && self.options.onDateSelected(date);
                                }
                                break;
                            case PickerTypes.month:
                                var month = $target.data("month");
                                if (typeof month == "number") {
                                    self.currentMonth = month;
                                    self.renderDate(self.currentYear);
                                    self.setYearMonthText();
                                }
                                break;
                            case PickerTypes.year:
                                var year = $target.data("year");
                                if (year) {
                                    self.currentYear = year;
                                    self.renderDate(self.currentYear);
                                    self.setYearMonthText();
                                }
                                break;
                            default:
                        }
                    }

                }
            }).on("transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd", function () {
                self.$dateBody
                    .removeClass("dp-slide")
                    .setTranslate3d(-self.winWidth + "px", 0, 0);
            });

            self.$btnPrevYear.on("click", function () {
                switch (self.pickerType) {
                    case PickerTypes.date:
                        self.renderDate(--self.currentYear);
                        self.$btnYear.text(self.currentYear);
                        break;
                    case PickerTypes.year:
                        self.goYears(SwipeDirections.right);
                        break;
                    default:
                }
            })
            self.$btnNextYear.on("click", function () {
                switch (self.pickerType) {
                    case PickerTypes.date:
                        self.renderDate(++self.currentYear);
                        self.$btnYear.text(self.currentYear);
                        break;
                    case PickerTypes.year:
                        self.goYears(SwipeDirections.left);
                        break;
                    default:
                }
            })
            self.$btnYear.on("click", function () {
                self.renderYear();
            })

            self.$btnPrevMonth.on("click", function () {

                switch (self.pickerType) {
                    case PickerTypes.date:
                        self.goDates(self.currentMonth - 1);
                        break;
                    case PickerTypes.month:
                        self.goMonth(self.currentMonth - 1);
                        break;
                    case PickerTypes.year:
                        break;
                    default:
                }

            })
            self.$btnNextMonth.on("click", function () {
                switch (self.pickerType) {
                    case PickerTypes.date:
                        self.goDates(self.currentMonth + 1);
                        break;
                    case PickerTypes.month:
                        self.goMonth(self.currentMonth + 1);
                        break;
                    case PickerTypes.year:
                        break;
                    default:
                }
            })
            self.$btnMonth.on("click", function () {
                self.renderMonth();
            })
        },
        goYears: function (leftOrRight) {// leftOrRight往左或往右滑动，-1表示往左，0表示不变，1表示往右

            var startYear = parseInt((this.currentSelectYear - this.currentSelectYear % 10) / 10) * 10;
            this.currentSelectYear = this.currentSelectYear - leftOrRight * 10;
            this.$dateBody
                      .addClass("dp-slide")
                      .setTranslate3d((leftOrRight - 1) * this.winWidth + "px", 0, 0);

            if (leftOrRight == SwipeDirections.left) {//往左滑动,则看右侧内容                
                startYear = startYear + 19;
                this.$dateBody
                       .append(this.createYearHtml(startYear))
                       .children().eq(0).remove();
            }
            else if (leftOrRight == SwipeDirections.right) {//往右滑动，则看左侧内容
                startYear = startYear - 21;
                this.$dateBody
                        .prepend(this.createYearHtml(startYear))
                        .children().eq(this.$dateBody.children().length - 1).remove();
            }

        },
        goMonth: function (targetMonth) {
            if (targetMonth < 0) {
                this.currentYear--;
                targetMonth = 11;
            }
            else if (targetMonth > 11) {
                this.currentYear++;
                targetMonth = 0;
            }
            var $Months = this.$dateBody.find(".dp-month")
                .children().removeClass("select")
                .eq(targetMonth).addClass("select");

            this.currentMonth = targetMonth;

            this.setYearMonthText();
        },
        goDates: function (targetMonth) {

            this.$dateBody
                .addClass("dp-slide")
                .setTranslate3d((this.currentMonth - targetMonth - 1) * this.winWidth + "px", 0, 0);

            if (this.currentMonth != targetMonth) {

                if (targetMonth > 11 || targetMonth > this.currentMonth) {
                    if (targetMonth > 11) {
                        targetMonth = 0;
                        this.currentYear++;
                    }

                    //生成目标月份的下一个月并删除第一个同级元素
                    var nextMonth = targetMonth + 1;
                    var nextYear = this.currentYear;
                    if (nextMonth > 11) {
                        nextMonth = 0;
                        nextYear++;
                    }
                    this.$dateBody
                        .append(this.createDateHtml(nextYear, nextMonth))
                        .children().eq(0).remove();
                }
                else if (targetMonth < 0 || targetMonth < this.currentMonth) {
                    if (targetMonth < 0) {
                        targetMonth = 11;
                        this.currentYear--;
                    }

                    //生成目标月份的前一个月份并删除最后一个同级元素
                    var prevMonth = targetMonth - 1;
                    var prevYear = this.currentYear;
                    if (prevMonth < 0) {
                        prevMonth = 11;
                        prevYear--;
                    }
                    this.$dateBody
                        .prepend(this.createDateHtml(prevYear, prevMonth))
                        .children().eq(this.$dateBody.children().length - 1).remove();
                }

                this.currentMonth = targetMonth;

                this.setYearMonthText();
            }

        },
        setYearMonthText: function () {
            this.$btnYear.text(this.currentYear);
            this.$btnMonth.text((this.currentMonth + 1) + "月");
        },
        isDateDisabled: function (date, currentMonth) {
            return (this.options.minDate && Math.ceil(date.dateDiff(this.options.minDate)) < 0)
                || (this.options.maxDate && Math.ceil(date.dateDiff(this.options.maxDate)) > 0)
                || currentMonth != date.getMonth();
        },
        show: function () {
            this.$container.addClass("show");
        },
        hide: function () {
            this.$container.removeClass("show");
        }
    }

    $.fn.datePicker = function (options) {
        var defaults = {
            minDate: new Date(),
            maxDate: null,
            onDateSelected: null
        };
        options = $.extend(defaults, options || {});
        return new DatePicker($(this), options);
    }

})(window.Zepto || window.jQuery, window, document);