const dispatcher = d3.dispatch("filterCat")
let barchart;
let data;
let linechart;
let planetFilter = [];

d3.csv('data/exoplanets-1.csv')
    .then(_data => {
        data = _data
        console.log('Data loading complete. Work with dataset.');
        starCount = {}
        planetCount = {}
        spectypeCount = {}
        discmethodCount = {}
        filteredSpecType = {}
        discOverTime = {}

        hab_zone_range =
        {
            "A": {"inner": 8.5, "outer": 12.5},
            "F": {"inner": 1.5, "outer": 2.2},
            "K": {"inner": 0.95, "outer": 1.4},
            "G": {"inner": 0.38, "outer": 0.56},
            "M": {"inner": 0.08, "outer": 0.12}
        }
        
        function habitable_zone(spectype, au){
            return (hab_zone_range.hasOwnProperty(spectype)) ? au > hab_zone_range[spectype]['inner'] && au < hab_zone_range[spectype]['outer'] : undefined
        }

        data.forEach(d => { //ARROW function - for each object in the array, pass it as a parameter to this function
                d.disc_year = +d.disc_year;
                d.pl_bmasse = +d.pl_bmasse;
                d.pl_orbeccen = +d.pl_orbeccen;
                d.pl_orbsmax = +d.pl_orbsmax;
                d.pl_rade = +d.pl_rade;
                d.st_mass = +d.st_mass;
                d.st_rad = +d.st_rad;
                d.sy_dist = +d.sy_dist;
                d.sy_pnum = +d.sy_pnum;
                d.sy_snum = +d.sy_snum;
                d.spectype = d.st_spectype === "" ? "Un" : d.st_spectype[0];
                d.habitable = habitable_zone(d.spectype, d.pl_orbsmax)

            });

            // Create an instance (for example in main.js)
            barchart = new Barchart({
                'parentElement': '#barchart'
            }, data, "sy_snum", starCount, undefined);
            barchart.updateVis();

            // Create an instance (for example in main.js)
            barchart2 = new Barchart({
                'parentElement': '#barchart2'
            }, data,"sy_pnum", planetCount);
            barchart2.updateVis();

            barchart3 = new Barchart({
                'parentElement': '#barchart3',
                'specifier': '.1s',
                'axisVal': 1e3,
                'filter': ['A', 'F', 'G', 'K', 'M', 'Un'],
                'extraMarg': 15,
            }, data,"spectype", spectypeCount);
            barchart3.updateVis();

            barchart4 = new Barchart({
                'parentElement': '#barchart4',
                'rotate': 25
            }, data,"discoverymethod", discmethodCount);
            barchart4.updateVis();

            linechart = new Linechart({ 
                'parentElement': '#linechart'
            }, data, "disc_year", discOverTime);
            linechart.updateVis();

            doublebarchart = new doubleBarchart({
                'parentElement': '#doublebarchart',
                'column': 'pl_obrsmax'
            }, data)

            scatterplot = new Scatterplot({ parentElement: '#scatterplot'}, data);
            scatterplot.updateVis();

            histogram = new Histogram({ parentElement: '#histogram'}, data);
            histogram.updateVis()

            table = new Table({ parentElement: '#table'}, data);
    })
    .catch(error => {
    console.error('Error loading the data', error);
    });

      function filterData() {
        if (planetFilter.length == 0) {
          barchart.data = data;
          barchart2.data = data;
          barchart3.data = data;
          barchart4.data = data;
          linechart.data = data;
          scatterplot.data = data;
          histogram.data = data;
          doublebarchart.data = data;
          table.data = data;
        } else {
          barchart.data = data.filter(d => planetFilter.includes(d.pl_name));
          barchart2.data = data.filter(d => planetFilter.includes(d.pl_name));
          barchart3.data = data.filter(d => planetFilter.includes(d.pl_name));
          barchart4.data = data.filter(d => planetFilter.includes(d.pl_name));
          doublebarchart.data = data.filter(d => planetFilter.includes(d.pl_name));
          scatterplot.data = data.filter(d => planetFilter.includes(d.pl_name));
          histogram.data = data.filter(d => planetFilter.includes(d.pl_name));
          linechart.data = data.filter(d => planetFilter.includes(d.pl_name));
        }
        barchart.updateVis();
        barchart2.updateVis();
        barchart3.updateVis();
        barchart4.updateVis();
        doublebarchart.updateVis();
        linechart.updateVis();
        scatterplot.updateVis();
        histogram.updateVis();
        table.updateVis();
      }
      





