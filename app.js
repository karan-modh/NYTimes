const NYTBaseUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?api-key=4G8j86IxW7LBVrzEpuWJ6lBHCtzPU4m2&sort=newest';
const YEARS = ['2011','2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'];
const NAVLINKS = "Dashboard, Articles, Analytics, Messages, Calendar";

function buildUrl(BaseUrl,url){
    return BaseUrl + "&" + url;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const mv = new Vue({
    el: '#navbar',
    data: {
        headings: NAVLINKS.split(", "),
    },
});

const vm = new Vue({
    el: '#app',
    data: {
        results: [],
        hits: "",
        searched: "",
        mapData: [],
        loading: false,
        query: "",
        page: 0,
    },
    methods: {
        retreive: function (query,page){
            this.loading = true;
            this.results = [];
            console.log("In Retrieve function");
            var qendp = "q=" + query;
            if(page<0){page=0;}
            this.page = page;
            var pag = "page=" + page.toString();
            var url;
            if(query==""){
                qendp="";
                this.searched = "home";
                url=NYTBaseUrl;
            }
            else{
                url = buildUrl(NYTBaseUrl,qendp);
            }
            url = buildUrl(url,pag);
            axios.get(url).then(response => {
                const data = response.data.response;
                this.results = data.docs;
                this.hits = data.meta.hits;
                this.loading = false;
            }).catch( error => { console.log(error);});
            this.searched = query;
            this.mapData = [];
            this.generateData(url);
        },
        dateformat: function (date){
            var year = date.slice(0,4);
            var mon = date.slice(5,7);
            var day = date.slice(8,10);
            date = day + "-" + mon + "-" + year;
            return date;
        },
        generateData:async function (url){
            await sleep(6000);
            console.log("In generateData func after 6secs.");
            for(let i=0;i<YEARS.length;i++){
                console.log("inside for loop");
                var fq = "fq=pub_year:(" + YEARS[i] + ")";
                var tempurl = buildUrl(url,fq);
                axios.get(tempurl).then(response => {
                    const data = response.data.response.meta;
                    this.mapData.push(data.hits);
                }).catch(error => { bar.log(error)});
                await sleep(6000);
            }        
            var ctx = document.getElementById('myChart');
            var myChart = new Chart(ctx, {
                type: 'line',
                data:{
                    labels: YEARS,
                    datasets: [{
                        label: '# of Publications',
                        data: this.mapData,
                    }]
                },
                // [10,20,30,40,50,30,45,20,35,15]
                options: {
                    elements: {
                        line: {
                            cubicInterpolationMode: 'monotone',
                        }
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    }
                }
            });
        },
    }
});

