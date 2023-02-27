class Barchart {

    /**
     * Class constructor with basic chart configuration
     * @param {Object}
     * @param {Array}
     */
    constructor(_config, _data, _col) {
      // Configuration object with defaults
      this.config = {
        parentElement: _config.parentElement,
        containerWidth: _config.containerWidth || 300,
        containerHeight: _config.containerHeight || 175,
        margin: _config.margin || {top: 10, right: 5, bottom: 25, left: 35},
        extraMarg: _config.extraMarg || 5,
        reverseOrder: _config.reverseOrder || false,
        tooltipPadding: _config.tooltipPadding || 15,
        specifier: _config.specifier || '.0',
        axisVal: _config.axisVal || 1e3,
        rotate: _config.rotate || 0,
        filter: _config.filter || undefined
      }
      this.data = _data;
      this.col = _col;
      this.initVis();
    }
    
    /**
     * Initialize scales/axes and append static elements, such as axis titles
     */
    initVis() {
      let vis = this;
  
      // Calculate inner chart size. Margin specifies the space around the actual chart.
      vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
      vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;
  
      // Initialize scales and axes
      vis.yScale = d3.scaleLinear()
          .range([vis.height, 0]) 
  
      vis.xScale = d3.scaleBand()
          .range([0, vis.width])
          .paddingInner(0.2);
  
      vis.xAxis = d3.axisBottom(vis.xScale)
          .tickSizeOuter(0);
  
      vis.yAxis = d3.axisLeft(vis.yScale)
          .ticks(6)
          .tickSizeOuter(0)
          .tickFormat(d3.formatPrefix(vis.config.specifier, vis.config.axisVal));
  
      // Define size of SVG drawing area
      vis.svg = d3.select(vis.config.parentElement)
          .attr('width', vis.config.containerWidth)
          .attr('height', vis.config.containerHeight);
  
      // SVG Group containing the actual chart; D3 margin convention
      vis.chart = vis.svg.append('g')
          .attr('transform', `translate(${vis.config.margin.left + vis.config.extraMarg},${vis.config.margin.top})`);
  
      // Append empty x-axis group and move it to the bottom of the chart
      vis.xAxisG = vis.chart.append('g')
          .attr('class', 'axis x-axis')
          .attr('transform', `translate(0,${vis.height})`);
      
      // Append y-axis group 
      vis.yAxisG = vis.chart.append('g')
          .attr('class', 'axis y-axis');
    }
  
    /**
     * Prepare data and scales before we render it
     */
    updateVis() {
      let vis = this;
      //console.log("bar1update")
      // Reverse column order depending on user selection

      vis.data = Array.from(d3.rollup(vis.data, v => v.length, d => d[vis.col]));

      if (vis.config.reverseOrder){
        vis.data.reverse();
      }

      // if {fi}
      vis.data.sort((a, b) => a[1] - b[1])
      if (vis.config.filter) {
        vis.data = vis.data.filter(d => vis.config.filter.includes(d[0]))
      }
  
      // Specificy x- and y-accessor functions
      vis.xValue = d => d[0];
      vis.yValue = d => d[1];
  
      // Set the scale input domains
      vis.xScale.domain(vis.data.map(vis.xValue));
      vis.yScale.domain([0, d3.max(vis.data, vis.yValue)]);
  
      vis.renderVis();
    }
  
    /**
     * Bind data to visual elements
     */
    renderVis() {
      let vis = this;
  
      // Add rectangles
      let bars = vis.chart.selectAll('.bar')
          .data(vis.data, vis.xValue)
          .join('rect')
          .on('click', function(event, d) {
            console.log(d);
            const isActive = planetFilter.length > 0;
            if (isActive) {
              planetFilter = []; // Remove filter
            } else {
              data.forEach(e => {if (e[vis.col] == d[0]) {planetFilter.push(e.pl_name)}}); // Append filter
            }
            filterData();
            d3.select(this).classed('active', !isActive); // Add class to style active filters with CSS
          });
      
      bars.style('opacity', 0.5)
        .transition().duration(1000)
          .style('opacity', 1)
          .attr('class', 'bar')
          .attr('x', d => vis.xScale(vis.xValue(d)))
          .attr('width', vis.xScale.bandwidth())
          .attr('height', d => vis.height - vis.yScale(vis.yValue(d)))
          .attr('y', d => vis.yScale(vis.yValue(d)))
      
      // Tooltip event listeners
      bars
          .on('mouseover', (event,d) => {
            d3.select('#tooltip')
              .style('display', 'block')
              .style('opacity', 1)
              .html(`<div class="tooltip-label">Frequency</div>${d3.format(',')(d[1])}`)
              
          if (vis.col == 'discoverymethod') {
            d3.select('#tooltip')
              .style('display', 'block')
              .style('opacity', 1)
              .html(`
                  <div>Discovery method: ${d[0]}</div>
                  <div class="tooltip-label">Frequency</div>${d3.format(',')(d[1])}
                `)
              }
          })
          .on('mousemove', (event) => {
            d3.select('#tooltip')
              .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')   
              .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          })
          .on('mouseleave', () => {
            d3.select('#tooltip').style('opacity', 0);
          });
  
      // Update axes
      vis.xAxisG
          .transition().duration(1000)
          .call(vis.xAxis)
          .selectAll('text')
            .style('text-anchor', 'start')
            .attr('transform', `rotate(${vis.config.rotate})`)
  
      vis.yAxisG.call(vis.yAxis);
    }
  }
  
  