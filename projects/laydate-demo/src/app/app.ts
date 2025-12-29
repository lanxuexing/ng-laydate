import { Component, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { NgLaydateDirective, NgLaydateComponent, NgLaydateService } from 'ng-laydate';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NgLaydateDirective, NgLaydateComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.component.scss'
})
export class App implements AfterViewInit {
  title = 'ng-laydate';
  private laydate = inject(NgLaydateService);

  // Responsive Form
  myForm = new FormGroup({
    date: new FormControl('2024-05-01')
  });

  // Template-driven Form
  templateModel = '2024-05-02';

  ngAfterViewInit() {
    // 14. Programmatic Render Demo
    this.laydate.render({
      elem: '#ID-laydate-type-datetime',
      type: 'datetime',
      done: (value) => {
        console.log('Programmatic select:', value);
      }
    });
  }

  onDateChange(val: string) {
    console.log('Date selected:', val);
  }

  showHint() {
    this.laydate.hint('test-hint', {
      content: 'This is a hint! <br> 3 seconds to close',
      ms: 3000
    });
  }

  functionalShortcuts = [
    {
      text: '昨天',
      value: () => {
        const now = new Date();
        now.setDate(now.getDate() - 1);
        return now;
      }
    },
    {
      text: '今天',
      value: () => new Date()
    },
    {
      text: '明天',
      value: () => {
        const now = new Date();
        now.setDate(now.getDate() + 1);
        return now;
      }
    },
    {
      text: '上个月',
      value: () => {
        const now = new Date();
        now.setMonth(now.getMonth() - 1);
        return now;
      }
    },
    {
      text: '下个月',
      value: () => {
        const now = new Date();
        now.setMonth(now.getMonth() + 1);
        return now;
      }
    },
    {
      text: '某一天',
      value: () => '2018-08-18'
    }
  ];

  advancedShortcuts = [
    { text: 'String (Yesterday)', value: 'yesterday' },
    { text: 'Date (Today)', value: new Date() },
    {
      text: 'Array (Last 5 Days)', value: [
        new Date(new Date().getTime() - 5 * 24 * 3600 * 1000),
        new Date()
      ]
    },
    {
      text: 'Function (Next Week)', value: () => {
        const now = new Date();
        const next = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
        return [now, next];
      }
    }
  ];

  disabledDate = (date: Date, type?: string) => {
    // Disable dates before 2024-02-01
    return date.getTime() < new Date(2024, 1, 1).getTime();
  };

  disabledDateFuture = (date: Date, type?: string) => {
    return date.getTime() > Date.now();
  };

  onLimitReady = () => {
    this.laydate.hint('ins22', {
      content: '日期可选值设定在 <br> 2016-10-14 到 2080-10-14',
      ms: 3000
    });
  };

  disabledTimeComplex = (date: Date, type?: string): any => {
    return {
      hours: () => this.range(0, 10),
      minutes: (hour: number) => hour > 5 ? this.range(0, 20) : [],
      seconds: (hour: number, minute: number) => this.range(0, 2)
    };
  };

  isDisabledTimeDemo = (date: Date) => {
    // Disable time: 0-9 hours, min 0-19 if hour > 5, sec 0-1
    return {
      hours: () => this.range(0, 10),
      minutes: (hour: number) => hour > 5 ? this.range(0, 20) : [],
      seconds: (hour: number, minute: number) => this.range(0, 2)
    };
  };



  // 1. Basic Date Shortcuts
  shortcutsDate = [
    {
      text: "昨天",
      value: function () {
        var now = new Date();
        now.setDate(now.getDate() - 1);
        return now;
      }
    },
    {
      text: "今天",
      value: function () {
        return Date.now();
      }
    },
    {
      text: "明天",
      value: function () {
        var now = new Date();
        now.setDate(now.getDate() + 1);
        return now;
      }
    },
    {
      text: "上个月",
      value: function () {
        var now = new Date();
        var month = now.getMonth() - 1;
        now.setMonth(month);
        if (now.getMonth() !== month) now.setDate(0);
        return [now];
      }
    },
    {
      text: "下个月",
      value: function () {
        var now = new Date();
        var month = now.getMonth() + 1;
        now.setMonth(month);
        if (now.getMonth() !== month) now.setDate(0);
        return [now];
      }
    },
    {
      text: "某一天",
      value: "2016-10-14"
    }
  ];

  // 2. Year Shortcuts
  shortcutsYear = [
    {
      text: "去年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() - 1);
        return now;
      }
    },
    {
      text: "明年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() + 1);
        return now;
      }
    }
  ];

  // 3. Month Shortcuts
  shortcutsMonth = [
    {
      text: "上个月",
      value: function () {
        var now = new Date();
        now.setMonth(now.getMonth() - 1, 1);
        return now;
      }
    },
    {
      text: "下个月",
      value: function () {
        var now = new Date();
        now.setMonth(now.getMonth() + 1, 1);
        return now;
      }
    },
    {
      text: "去年本月",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() - 1);
        return now;
      }
    }
  ];

  // 4. Time Shortcuts (Generated)
  shortcutsTime = (function () {
    var value = [];
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    for (var i = 0; i < 48; i++) {
      var nowTemp = new Date(now.getTime() + i * 30 * 60000);
      var h = nowTemp.getHours().toString().padStart(2, '0');
      var m = nowTemp.getMinutes().toString().padStart(2, '0');
      var s = nowTemp.getSeconds().toString().padStart(2, '0');
      var nowTimeStr = `${h}:${m}:${s}`;
      value.push({
        text: nowTimeStr,
        value: nowTimeStr
      });
    }
    return value;
  })();

  // 5. DateTime Shortcuts
  shortcutsDateTime = [
    {
      text: "昨天",
      value: function () {
        var now = new Date();
        now.setDate(now.getDate() - 1);
        return now;
      }
    },
    {
      text: "今天",
      value: function () {
        return Date.now();
      }
    },
    {
      text: "明天",
      value: function () {
        var now = new Date();
        now.setDate(now.getDate() + 1);
        return now;
      }
    },
    {
      text: "上个月",
      value: function () {
        var now = new Date();
        var month = now.getMonth() - 1;
        now.setMonth(month);
        if (now.getMonth() !== month) now.setDate(0);
        return [now];
      }
    },
    {
      text: "下个月",
      value: function () {
        var now = new Date();
        var month = now.getMonth() + 1;
        now.setMonth(month);
        if (now.getMonth() !== month) now.setDate(0);
        return [now];
      }
    },
    {
      text: "某一天",
      value: "2016-10-14 10:00:00"
    }
  ];

  // 6. DateTime FullPanel Shortcuts
  shortcutsDateTimeFull = [
    { text: "昨天", value: function () { var now = new Date(); now.setDate(now.getDate() - 1); return now; } },
    { text: "今天", value: Date.now() },
    { text: "明天", value: function () { var now = new Date(); now.setDate(now.getDate() + 1); return now; } },
    { text: "上个月", value: function () { var now = new Date(); var month = now.getMonth() - 1; now.setMonth(month); if (now.getMonth() !== month) now.setDate(0); return [now]; } },
    { text: "下个月", value: function () { var now = new Date(); var month = now.getMonth() + 1; now.setMonth(month); if (now.getMonth() !== month) now.setDate(0); return [now]; } },
    { text: "某一天", value: "2016-10-14 09:30:00" }
  ];

  // 7. Range Shortcuts
  shortcutsRange = [
    {
      text: "上个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month - 1, 1),
          new Date(year, month, 0)
        ];
      }
    },
    {
      text: "这个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month, 1),
          new Date(year, month + 1, 0)
        ];
      }
    },
    {
      text: "下个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month + 1, 1),
          new Date(year, month + 2, 0)
        ];
      }
    }
  ];

  // 8. Year Range Shortcuts
  shortcutsYearRange = [
    {
      text: "过去一年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() - 1);
        return [now, new Date()];
      }
    },
    {
      text: "未来一年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() + 1);
        return [new Date(), now];
      }
    },
    {
      text: "近三年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() - 3);
        return [now, new Date()];
      }
    }
  ];

  // 9. Month Range Shortcuts
  shortcutsMonthRange = [
    {
      text: "去年",
      value: function () {
        var now = new Date();
        var year = now.getFullYear() - 1;
        return [
          new Date(year, 0),
          new Date(year, 11)
        ];
      }
    },
    {
      text: "明年",
      value: function () {
        var now = new Date();
        var year = now.getFullYear() + 1;
        return [
          new Date(year, 0),
          new Date(year, 11)
        ];
      }
    },
    {
      text: "近三年",
      value: function () {
        var now = new Date();
        now.setFullYear(now.getFullYear() - 3);
        return [now, new Date()];
      }
    }
  ];

  // 10. Time Range Shortcuts
  shortcutsTimeRange = [
    {
      text: '09:30 <p style="text-align: center;">到</p> 11:30',
      value: (function () {
        var date1 = new Date();
        date1.setHours(9, 0, 0, 0);
        var date2 = new Date();
        date2.setHours(11, 30, 0, 0);
        return [date1, date2];
      })
    },
    {
      text: '13:00 <p style="text-align: center;">到</p> 15:00',
      value: (function () {
        var date1 = new Date();
        date1.setHours(13, 0, 0, 0);
        var date2 = new Date();
        date2.setHours(15, 0, 0, 0);
        return [date1, date2];
      })
    }
  ];

  // 11. DateTime Range Shortcuts
  shortcutsDateTimeRange = [
    {
      text: "上个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month - 1, 1),
          new Date(year, month, 0, 23, 59, 59)
        ];
      }
    },
    {
      text: "这个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month, 1),
          new Date(year, month + 1, 0, 23, 59, 59)
        ];
      }
    },
    {
      text: "下个月",
      value: function () {
        var date = new Date();
        var year = date.getFullYear();
        var month = date.getMonth();
        return [
          new Date(year, month + 1, 1),
          new Date(year, month + 2, 0, 23, 59, 59)
        ];
      }
    }
  ];

  range(start: number, end: number) {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  }

  markFunction = (ymd: any, render: any) => {
    var y = ymd.year;
    var m = ymd.month;
    var d = ymd.date;
    // String
    if (m === 6 && d === 1) return render('Children');
    // Object
    return render({
      '0-10-14': 'Birthday',
      '0-0-15': 'Mid', // Mid-month
      '2024-3-20': 'v2',
      '2024-3-31': 'End'
    });
  };

  cellRenderDemo = (ymd: any, render: any, info: any) => {
    // Custom render for the 8th of every month
    if (info.type === 'date' && ymd.date === 8) {
      render(`<span style="color: #16b777; font-weight: bold; border: 1px solid #16b777; border-radius: 50%; width: 22px; height: 22px; line-height: 22px; display: inline-block;">${ymd.date}</span>`);
    }
  };

  displayFormatConfig = {
    formatToDisplay: (value: string) => {
      const date = new Date(value);
      const weekday = date.toLocaleDateString('zh-CN', { weekday: 'long' });
      return value ? `${value} ${weekday}` : '';
    }
  };
}
