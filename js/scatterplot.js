class Scatterplot {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 775,
      containerHeight: _config.containerHeight || 175,
      margin: _config.margin || {top: 25, right: 20, bottom: 25, left: 50},
      tooltipPadding: _config.tooltipPadding || 15
    }
    this.data = _data.filter(d => {return d.pl_rade !== 0 && d.pl_bmasse !== 0});
    this.initVis();
  }
  
  /**
   * We initialize scales/axes and append static elements, such as axis titles.
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleLog()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLog()
        .range([vis.height, 0]);

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(10)
        .tickPadding(10)
        .tickFormat(d3.formatPrefix('.0s', 1e2))

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(3)
        .tickPadding(10)
        .tickFormat(d3.formatPrefix('.0s', 1e2));

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart 
    // and position it according to the given margin config
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis')

    // Append both axis titles
    vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', vis.height - 15)
        .attr('x', vis.width + 10)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .attr('font-weight', 500)
        .text('Radius');

    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.71em')
        .attr('font-weight', 500)
        .text('Mass');
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    vis.data = vis.data.filter(d => {return d.pl_rade !== 0 && d.pl_bmasse !== 0});
    
    // Specificy accessor functions
    //vis.colorValue = d => d.difficulty;
    vis.xValue = d => d.pl_rade;
    vis.yValue = d => {
      if(d.pl_bmasse == 0){
        return 0.1;
      }
      else{
        return d.pl_bmasse;
      }
    };

    // Set the scale input domains
    vis.xScale.domain([1e-1, d3.max(vis.data, vis.xValue)]);
    vis.yScale.domain([1e-2, d3.max(vis.data, vis.yValue)]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements.
   */
  renderVis() {
    let vis = this;

    // Add circles
    const circles = vis.chart.selectAll('.point')
        .data(vis.data, d => d.pl_name)
      .join('circle')
        .attr('class', 'point')
        .attr('r', 4)
        .attr('cy', d => vis.yScale(vis.yValue(d)))
        .attr('cx', d => vis.xScale(vis.xValue(d)))
        .attr('fill', '#776cc4')
        .attr('id', 'scatter-point')

    // Tooltip event listeners
    circles
        .on('mouseover', (event,d) => {
          d3.select('#tooltip')
            .style('display', 'block')
            .style('opacity', 1)
            .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
            .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
            .html(`
              <div class="tooltip-title">${d.pl_name}</div>
              <div><i></i></div>
              <ul>
                <li>Planet Radius: ${d.pl_rade}</li>
                <li>Planet Mass: ${d.pl_bmasse}</li>
                <li>System name: ${d.sys_name}</li>
              </ul>
            `);
        })
        .on('mouseleave', () => {
          d3.select('#tooltip').style('display', 'none');
        })
        .on('click', (event, d) => {
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
    
    // Update the axes/gridlines
    vis.xAxisG
        .call(vis.xAxis)

    vis.yAxisG
        .call(vis.yAxis)
  }
}