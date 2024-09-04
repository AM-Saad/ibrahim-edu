
// /*jslint browser: true*/

// /*global console, alert, $, jQuery, hamburger_cross*/

// (function () {
//     const analytics = {
//         examId: $('input[name="examId"]').val(),
//         choosenCompanyResult: '',
//         fetchedExpenses: [],
//         fetchedSales: [],
//         selectedCenter: null,
//         init: async function () {
//             this.cashDom()
//             this.bindEvents()

//         },
//         cashDom: function () {
//             this.centers = $('#toggle-centers')
//             this.search = $('#search')
//             this.chooseCenter = $('.form-check-input')
//         },
//         bindEvents: function () {
//             this.centers.on('click', analytics.toggleCenters.bind(this))
//             this.chooseCenter.on('click', analytics.getCenter.bind(this))
//             this.search.on('click', analytics.getTakenStudents.bind(this))
//         },


//         getTakenStudents: async () => {
//             const center = analytics.selectedCenter
//             console.log(center);
//             if (!center) return message('Choose Center', 'info', 'body')
//             const data = await fetchdata(`/public/api/search/exams/${analytics.examId}?center=${center}`, 'put', JSON.stringify({ center: center }), true)
//             if (data) {
//                 analytics.questionAnalytics(data.json.exams)
//             }

//         },
//         questionAnalytics: function () {
//             const thisMonthFilterations = analytics.makeDailySalesFilterations(thisMonth)
//             const lastMonthFilterations = analytics.makeDailySalesFilterations(lastMonth)
//             const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

//             const lastSalesThisMonth = thisMonth.length - 1
//             const dateOfLastSales = analytics.getDate(thisMonth[lastSalesThisMonth].salesDate)
//             if (lastMonth.length > 0) {

//                 //get last month sales until same day as today
//                 let lastMonthSalesLength = 0
//                 let lastMonthRevenue = 0
//                 lastMonth.forEach(s => {
//                     if (analytics.getDate(s.salesDate) <= dateOfLastSales) {
//                         lastMonthSalesLength += 1
//                         lastMonthRevenue += s.totalPrice
//                     }
//                 })


//                 const lastExpensesThisMonth = thisMonthExpenses.length - 1
//                 const dateOfLastExpenses = analytics.getDate(thisMonthExpenses[lastExpensesThisMonth].createdAt)

//                 let thisMonthTotalExpenses = 0;
//                 let lastMonthTotalExpenses = 0;
//                 thisMonthExpenses.forEach(e => {
//                     thisMonthTotalExpenses += e.total
//                 })
//                 lastMonthExpenses.forEach(e => {
//                     if (analytics.getDate(e.createdAt) <= dateOfLastExpenses) {
//                         lastMonthTotalExpenses += e.total
//                     }
//                 })


//                 let thisMonthRevenue = 0
//                 thisMonth.forEach(s => {
//                     thisMonthRevenue += s.totalPrice
//                 })

//                 let percentageOfSales
//                 let percentageOfRevenue
//                 let percentageOfExpenses
//                 if (lastMonthSalesLength < thisMonth.length) {
//                     percentageOfSales = 100 - ((lastMonthSalesLength / thisMonth.length) * 100)
//                 } else {
//                     percentageOfSales = 100 - ((thisMonth.length / lastMonthSalesLength) * 100)
//                 }

//                 if (lastMonthRevenue < thisMonthRevenue) {
//                     percentageOfRevenue = 100 - ((lastMonthRevenue / thisMonthRevenue) * 100)
//                 } else {
//                     percentageOfRevenue = 100 - ((thisMonthRevenue / lastMonthRevenue) * 100)
//                 }


//                 if (lastMonthTotalExpenses < thisMonthTotalExpenses) {
//                     percentageOfExpenses = 100 - ((lastMonthTotalExpenses / thisMonthTotalExpenses) * 100)
//                 } else {
//                     percentageOfExpenses = 100 - ((thisMonthTotalExpenses / lastMonthTotalExpenses) * 100)
//                 }

//                 const salesPercentageFloor = Math.floor(percentageOfSales)
//                 const revenuePercentageFloor = Math.floor(percentageOfRevenue)
//                 const expensesPercentageFloor = Math.floor(percentageOfExpenses)

//             }
//         },
//         // questionAnalytics: function (exams) {
//         //     const question = {}
//         //     const questionScore = {}
//         //     exams.forEach(e => {
//         //         for (const q of e.lessonQuestions) {
//         //             question[q._id] = (question[q._id] || 0) + 1

//         //             questionScore[q._id] = questionScore[q._id] ? q.point === 1 ? (questionScore[q._id] || 0) + 1 : 0
//         //         }
//         //         // e.lessonQuestions.forEach(q => {
//         //         //     question[q._id] = (question[q._id] || 0) + 1
//         //         // })
//         //         // itemRevenue[p.name] = (itemRevenue[p.name] || (p.quantity * p.price)) + (p.quantity * p.price)

//         //     })
//         //     console.log(question);

//         //     // let arr = Object.values(sellingItem);
//         //     // let max = Math.max(...arr);
//         //     // function getMaxValue(sellingItem, max) {
//         //     //     return Object.keys(sellingItem).find(key => sellingItem[key] === max);
//         //     // }
//         //     // const mostSellingItem = getMaxValue(sellingItem, max)

//         //     // return { mostSellingItem, itemRevenue, sellingItem }

//         // },
//         getMostPaidByItem: function (expenses) {
//             const expensesPaidBy = {}
//             expenses.forEach(e => {
//                 expensesPaidBy[e.paidBy] = (expensesPaidBy[e.paidBy] || 0) + 1
//             })
//             // console.log(Math.max.apply(Math, sellingItem.map(function (o) { return o.y; })))
//             let arr2 = Object.values(expensesPaidBy);
//             let max2 = Math.max(...arr2);
//             function getKeyByValue(expensesPaidBy, max) {
//                 return Object.keys(expensesPaidBy).find(key => expensesPaidBy[key] === max);
//             }
//             const mostPaidBy = getKeyByValue(expensesPaidBy, max2)
//             return { mostPaidBy, expensesPaidBy }
//         },
//         getMostPaidForItem: function (expenses) {

//             const expensesPaidFor = {}
//             expenses.forEach(e => {
//                 expensesPaidFor[e.for] = (expensesPaidFor[e.for] || e.total) + e.total
//             })
//             let arr1 = Object.values(expensesPaidFor);
//             let max = Math.max(...arr1);
//             function getKeyByValue(expensesPaidFor, max) {
//                 return Object.keys(expensesPaidFor).find(key => expensesPaidFor[key] === max);
//             }
//             const mostPaidFor = getKeyByValue(expensesPaidFor, max)
//             return { mostPaidFor, expensesPaidFor }

//         },

//         monthlyExpensesAnalytics: async function (from, to) {
//             // const sales = await analytics.searchSalesByDate(from, to)

//             analytics.fetchedExpenses = expenses

//             const totalExpenses = analytics.calcExpenses(expenses)
//             const paidBy = analytics.getMostPaidByItem(expenses)
//             const paidFor = analytics.getMostPaidForItem(expenses)

//             // analytics.renderCanvasForExpensesCharts()
//             analytics.renderMonthExpensesData(totalExpenses, expenses.length, paidFor.mostPaidFor, paidBy.mostPaidBy, from, to)
//             const filterations = analytics.makeDailyExpensesFilterations(expenses)
//             const chartData = analytics.makeDailyExpensesChartData(filterations.expensesPerDay, filterations.sources)
//             this.renderCanvasForExpensesCharts(chartData.expensesPerDayLabels, chartData.expensesPerDayData, chartData.expensesSource, chartData.expensessourceNo)
//             // const revenue = analytics.revenueForPeriod(sales)
//             return expenses
//         },

//         revenueForPeriod: function (sales) {
//             let totalRevenue = 0
//             sales.forEach(s => {

//                 totalRevenue += s.totalPrice
//             })
//             return totalRevenue
//         },
//         calcExpenses: function (expenses) {
//             let totalExpenses = 0
//             expenses.forEach(e => {

//                 totalExpenses += e.amount * e.quantity
//             })
//             return totalExpenses
//         },
//         toggleCenters: function (e) {
//             $('#centers').toggleClass('none')
//             // analytics.displayChart(Object.keys(orderPerMonth), Object.values(orderPerMonth))
//         },
//         getCenter: function (e) {
//             this.selectedCenter = e.target.value
//             console.log(this.selectedCenter);

//         },

//         makeDailySalesFilterations: function (sales) {
//             const salesPerDay = {}
//             const revenuePerDay = {}
//             const sources = {}
//             const sellers = {}
//             //get excat number of day in month
//             function myDate(date) {
//                 const newDate = new Date(date)
//                 return newDate.getDate()
//             }
//             sales.forEach(s => {
//                 salesPerDay[s.salesDate] = (salesPerDay[s.salesDate] || 0) + 1
//                 revenuePerDay[s.salesDate] = (revenuePerDay[s.salesDate] || 0) + s.totalPrice
//                 sources[s.leadSource] = (sources[s.leadSource] || 0) + 1
//                 sellers[s.creator.name] = (sellers[s.creator.name] || 0) + 1
//             })
//             return { salesPerDay, revenuePerDay, sources, sellers }

//         },
//         makeDailySalesChartData: function (salesPerDay) {

//             const salesPerDayLabels = Object.keys(salesPerDay)
//             const salesPerDayData = Object.values(salesPerDay)

//             return { salesPerDayLabels, salesPerDayData, }


//         },
//         makeDailyExpensesFilterations: function (expenses) {
//             const expensesPerDay = {}
//             const sources = {}
//             //get excat number of day in month
//             function myDate(date) {
//                 const newDate = new Date(date)
//                 return newDate.getDate()
//             }
//             expenses.forEach(e => {
//                 expensesPerDay[e.createdAt] = (expensesPerDay[e.createdAt] || e.total) + e.total
//                 sources[e.for] = (sources[e.for] || e.total) + e.total
//             })
//             return { expensesPerDay, sources }

//         },
//         renderCanvasForSalesCharts: function (salesPerDayLabels, salesPerDayData, revenuePerDayLabels, revenuePerDayData, sourceLabel, sourceData, sellerLabel, sellerData) {
//             if ($('#questionsChart').length > 0) {
//                 $('#questionsChart').remove()
//             }
//             $('.questionsChart').append('<canvas id="questionsChart"  role="img"></canvas>')



//             analytics.makeChart(salesPerDayLabels, salesPerDayData, 'questionsChart', 'bar', 'Sales', true)
//         },
//         makeDailyExpensesChartData: function (expensesPerDay, sources) {

//             const expensesPerDayLabels = Object.keys(expensesPerDay)
//             const expensesPerDayData = Object.values(expensesPerDay)
//             // const days = Object.keys(revenuePerDay)
//             // const revenue = Object.values(revenuePerDay)
//             const expensesSource = Object.keys(sources)
//             const expensessourceNo = Object.values(sources)


//             return { expensesPerDayLabels, expensesPerDayData, expensesSource, expensessourceNo }
//         },
//         renderCanvasForExpensesCharts: function (expensesPerDayLabels, expensesPerDayData, expensesSource, expensessourceNo) {
//             if ($('#expensesPerDayChart').length > 0) {
//                 $('#expensesPerDayChart').remove()
//             }
//             $('.expensesPerDayChart').append('<canvas id="expensesPerDayChart" width="400" height="400" role="img"></canvas>')
//             analytics.makeChart(expensesPerDayLabels, expensesPerDayData, 'expensesPerDayChart', 'bar', 'Amount/Day', true)


//             if ($('#expensesSource').length > 0) {
//                 $('#expensesSource').remove()
//             }
//             $('.expensesSource').append('<canvas id="expensesSource" width="400" height="400" role="img"></canvas>')
//             analytics.makeChart(expensesSource, expensessourceNo, 'expensesSource', 'doughnut', 'LeadSource', true)

//         },


//         makeChart: function (labels, data, canvasId, canvasType, label, fill) {
//             const canvas = document.getElementById(canvasId)
//             var ctx = canvas.getContext('2d');
//             ctx.clearRect(0, 0, canvas.width, canvas.height);

//             var myChart = new Chart(ctx, {
//                 type: canvasType,
//                 data: {
//                     labels: labels,
//                     datasets: [{
//                         label: label,
//                         data: data,
//                         backgroundColor: [
//                             'rgba(255, 99, 132, 1)',
//                             'rgba(54, 162, 235, 1)',
//                             'rgba(255, 206, 86, 1)',
//                             'rgba(75, 192, 192, 1)',
//                             'rgba(153, 102, 255, 1)',
//                             'rgba(255, 159, 64, 1)'
//                         ],
//                         borderColor: [
//                             'rgba(255, 99, 132, 1)',
//                             'rgba(54, 162, 235, 1)',
//                             'rgba(255, 206, 86, 1)',
//                             'rgba(75, 192, 192, 1)',
//                             'rgba(153, 102, 255, 1)',
//                             'rgba(255, 159, 64, 1)'
//                         ],
//                         borderWidth: 4,
//                         display: false,
//                         fill: fill
//                     }]
//                 },
//                 options: {
//                     color: [
//                         'red',    // color for data at index 0
//                         'blue',   // color for data at index 1
//                         'green',  // color for data at index 2
//                         'black',  // color for data at index 3
//                     ],


//                     scales: {
//                         yAxes: [{
//                             stacked: true,
//                             ticks: {
//                                 beginAtZero: true,
//                             }
//                         }]
//                     },
//                     legend: {
//                         display: false,
//                     }

//                 },

//             });
//             $(`#${canvasId}`).parent().find('.loading').removeClass('block')

//         },

//     }
//     analytics.init()
// })()


