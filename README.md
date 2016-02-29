# zepto.datepicker.js
基于zepto的移动端日期选择器（兼容jQuery）

1、支持选择年、月、日

2、支持日期的可选范围限制


### 基本使用
#### html
```
<input type="text" id="datePicker" />
```

#### css
```
<link href="zepto.datepicker.css" rel="stylesheet" />
```

#### script
```
$("#datePicker").datePicker();
```

### Demo
1、<a href="http://luopq.com/demo/datepicker/examples/index.html" target="_blank">Demo</a>
2、访问二维码<br/>
!(http://luopq.com/demo/zeptodatepicker/examples/demoQR.jpg)

### Options
|参数名|类型|默认值|描述|
|-----|----|------|---|
|minDate|Date|new Date()|可选日期范围的最小日期|
|maxDate|Date|null|可选日期范围的最大日期|
|currentDate|Date/String|null|当前选中日期|
|onDateSelected|function|null|选中日期后的回调函数，包含参数：当前选中日期|
