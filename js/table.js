class Table {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 620,
      containerHeight: _config.containerHeight || 175,
      margin: _config.margin || {top: 25, right: 20, bottom: 20, left: 35},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data;
    this.initVis();
  }

  initVis() {
    let vis = this;
    vis.table = new Tabulator("#table", {
        height:vis.config.containerHeight, // set height of table (in CSS or here), this enables the Virtual DOM and improves render speed dramatically (can be any valid css height value)
        data:vis.data, //assign data to table
        layout:"fitColumns", //fit columns to width of table (optional)
        //selectable: true,
        columns:[ //Define Table Columns
            {title:"Planet Name", field:"pl_name", width:150},
            {title:"Number of Stars", field:"pl_name", width:150},
            {title:"Number of Planets", field:"pl_name", width:150},
            {title:"Discovery Method", field:"pl_name", width:150},
            {title:"Discovery Year", field:"pl_name", width:150}
        ],
   });
   vis.updateVis();
  }

  updateVis() {
    let vis = this;
    vis.renderVis();

  }

  renderVis() {
    let vis = this;
    vis.table.on('rowClick', function(event, v){
      let d = v._row.data;
      console.log(d)
      d3.select('#pop-up')
        .style('display', 'block')
        .style('left', (event.pageX) + 'px')   
        .style('top', (event.pageY) + 'px')
        .style('opacity', 1)
        .html(`
          <div class="pop-up">
            <div class="pop-up-content">
              <span class="popup-close" id="popup-close">&times;</span>
              <span class="pop-up-title">Planet Info</span>
              <div><i>Planet Name: ${d.pl_name}</i></div>
              <ul>
                <li>Planet Radius: ${d.pl_rade}</li>
                <li>Planet Mass: ${d.pl_bmasse}</li>
                <li>System name: ${d.sys_name}</li>
                <li>Discovery Method: ${d.discoverymethod}</li>
                <li>Star Count: ${d.sy_snum}</li>
                <li>Planet Count: ${d.sy_pnum}</li>
              </ul>
            </div>
          </div>
        `)
        .on('click', (event, d) => {
          d3.select('#pop-up')
          .style('display', 'none')
        })
    })
  }
}
