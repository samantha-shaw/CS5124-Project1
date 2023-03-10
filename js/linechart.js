class Linechart {

  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(_config, _data, _col, _freqDict) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: _config.containerWidth || 625,
      containerHeight: _config.containerHeight || 125,
      margin: _config.margin || {top: 25, right: 30, bottom: 30, left: 50}
    }
    this.data = _data;
    this.col = _col;
    this.freqDict = _freqDict;

    this.data.forEach(d => {
      if (d[_col] in this.freqDict) {
        this.freqDict[d[_col]] += 1;
      }
      else {
        this.freqDict[d[_col]] = 1;
      }
    })

    this.data = _data.sort((a,b) => a[_col] - b[_col])
    this.initVis();
  }
  
  /**
   * Initialize scales/axes and append static chart elements
   */
  initVis() {
    let vis = this;

    vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
    vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

    vis.xScale = d3.scaleTime()
        .range([0, vis.width]);

    vis.yScale = d3.scaleLinear()
        .range([vis.height, 0])
        .nice();

    // Initialize axes
    vis.xAxis = d3.axisBottom(vis.xScale)
        .ticks(6)
        .tickSizeOuter(0)
        .tickFormat(d3.format('d'))
        .tickPadding(10);

    vis.yAxis = d3.axisLeft(vis.yScale)
        .ticks(4)
        .tickSizeOuter(0)
        .tickPadding(10);

    // Define size of SVG drawing area
    vis.svg = d3.select(vis.config.parentElement)
        .attr('width', vis.config.containerWidth)
        .attr('height', vis.config.containerHeight);

    // Append group element that will contain our actual chart (see margin convention)
    vis.chart = vis.svg.append('g')
        .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', `translate(0,${vis.height})`);
    
    // Append y-axis group
    vis.yAxisG = vis.chart.append('g')
        .attr('class', 'axis y-axis');

    // We need to make sure that the tracking area is on top of other chart elements
    vis.marks = vis.chart.append('g');
    vis.trackingArea = vis.chart.append('rect')
        .attr('width', vis.width)
        .attr('height', vis.height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all');

    // Empty tooltip group (hidden by default)
    vis.tooltip = vis.chart.append('g')
        .attr('class', 'tooltip')
        .style('display', 'none');

    vis.tooltip.append('circle')
        .attr('r', 4);

    vis.tooltip.append('text');

    vis.chart.append('text')
        .attr('class', 'axis-title')
        .attr('y', vis.height - 15)
        .attr('x', vis.width + 10)
        .attr('dy', '2.50em')
        .style('text-anchor', 'end')
        .attr('font-weight', 500)
        .text('Year');

    vis.svg.append('text')
        .attr('class', 'axis-title')
        .attr('x', 0)
        .attr('y', 0)
        .attr('dy', '.71em')
        .attr('font-weight', 500)
        .text('# of Discoveries');
  }

  /**
   * Prepare the data and scales before we render it.
   */
  updateVis() {
    let vis = this;
    
    vis.xValue = d => d[vis.col]
    vis.yValue = d => vis.freqDict[d[vis.col]]

    vis.line = d3.line()
        .x(d => vis.xScale(vis.xValue(d)))
        .y(d => vis.yScale(vis.yValue(d)));

    // Set the scale input domains
    vis.xScale.domain(d3.extent(vis.data, vis.xValue));
    vis.yScale.domain(d3.extent(vis.data, vis.yValue));

    vis.bisectDate = d3.bisector(vis.xValue).left;

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    // Add line path
    vis.marks.selectAll('.chart-line')
        .data([vis.data])
      .join('path')
        .attr('class', 'chart-line')
        .attr('d', vis.line);

    vis.trackingArea
        .on('mouseenter', () => {
          vis.tooltip.style('display', 'block');
          vis.tooltip.style('opacity', '1');
        })
        .on('mouseleave', () => {
          vis.tooltip.style('display', 'none');
        })
        .on('mousemove', function(event) {
          // Get date that corresponds to current mouse x-coordinate
          const xPos = d3.pointer(event, this)[0]; // First array element is x, second is y
          const year = vis.xScale.invert(xPos);

          // Find nearest data point
          const index = vis.bisectDate(vis.data, year, 1);
          const a = vis.data[index - 1];
          const b = vis.data[index];
          const d = b && (year - a.disc_year > b.disc_year - year) ? b : a; 

          // Update tooltip
          vis.tooltip.select('circle')
              .attr('transform', `translate(${vis.xScale(d[vis.col])},${vis.yScale(vis.freqDict[d[vis.col]])})`);
          
          vis.tooltip.select('text')
              .attr('transform', `translate(${vis.xScale(d[vis.col])},${(vis.yScale(vis.freqDict[d[vis.col]]) - 15)})`)
              .text(vis.freqDict[d[vis.col]]);
        });
    
    // Update the axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}