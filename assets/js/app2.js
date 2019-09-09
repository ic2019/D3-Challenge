// Defining svg width and height
const svgWidth = 960;
const svgHeight = 500;

const margin = {
    top: 20,
    right: 120,
    bottom: 90,
    left: 120
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins
const svg = d3
            .select("#scatter")
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
            

// Append an SVG group
const scatterGroup = svg.append("g")
                      .attr("transform", `translate(${margin.left}, ${margin.top})`);

 

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
                         .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.9,
                            d3.max(healthData, d=> d[chosenXAxis] * 1.1)
                          ])
                          .range([0, width + 20]);
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
                         .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
                            d3.max(healthData, d => d[chosenYAxis] * 1.1) 
                          ])
                          .range([height ,0]);
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
function renderAxesY(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

  // function used for updating circles group with a transition to
// new circles on change of X-axis
function renderCircles(circlesGroup, newXScale, newYScale, chosenXaxis, chosenYaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
  }

  // Function to render labels to circles with state abbr
  // on change of x and y axes.
  function renderCircleLabels(circleLabels, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    
    circleLabels = scatterGroup.selectAll(".stateText");
    
    circleLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]))
    .text(function(d) { return d.abbr; });
    

  return circleLabels;
  }


  // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

   var labelX = chosenXAxis;
   var labelY = chosenYAxis; 
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .style("display", "block")
      .offset([80, -60])
      .html(function(d) {
        return (`State: ${d.state}<br>${labelX}: ${d[chosenXAxis]}<br>${labelY}: ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }

  /**
   * End of functions
   */
  // Retrieve data from the CSV file and execute everything 
  url = "assets/data/data.csv";
  d3.csv(url).then(healthData => {
  //, function(err, data) {
    //if (error) throw error;
    //healthData = data;
    console.log(healthData);
    // parse data
    healthData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.healthcare = +data.healthcare; 
    });
  
    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);
  
    // yLinearScale function above csv import
    var yLinearScale = yScale(healthData, chosenYAxis);


    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);
  
    // append x axis
    var xAxis = scatterGroup.append("g")
      //.classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
        
    // append y axis
    var yAxis = scatterGroup.append("g")
      //.classed("y-axis", true)
      .call(leftAxis);
  
    // append initial circles
    var circlesGroup = scatterGroup.selectAll("circle")
      .data(healthData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 8)
      .classed("stateCircle", true)
      .attr("opacity", ".5");

    // Adding labels to the circles

    var circleLabels = scatterGroup.selectAll(null)
          .data(healthData)
          .enter()
          .append("text")
          .attr("x", d => xLinearScale(d[chosenXAxis]))
          .attr("y", d => yLinearScale(d[chosenYAxis]))
          .text(function(d) { return d.abbr; })
          .classed("stateText", true);


    // Create group for  3 x- axis labels
    var labelsGroupX = scatterGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var povertyLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var ageLabel = labelsGroupX.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    var incomeLabel = labelsGroupX.append("text")
       .attr("x", 0)
       .attr("y", 60)
       .attr("value", "income") // value to grab for event listener
       .classed("inactive", true)
       .text("Household Income (Median)");

       // Create group for 3 y-axis labels
    var labelsGroupY = scatterGroup.append("g")
            .attr("transform", "rotate(-90)");            

       
    var healthcareLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 60)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    var obeseLabel = labelsGroupY.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .classed("inactive", true)
        .text("Obese (%)");
    
  
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    

    // x axis labels event listener
    labelsGroupX.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {
  
          // replaces chosenXAxis with value
          chosenXAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(healthData, chosenXAxis);
  
          // updates x axis with transition
          xAxis = renderAxesX(xLinearScale, xAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
          // changes classes to change bold text
           switch (chosenXAxis) {
            case "poverty":
                {
                povertyLabel.classed("active", true).classed("inactive", false);
                ageLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active",false).classed("inactive", true);
                break;
                }
            case "age":
                {
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", true).classed("inactive", false);
                incomeLabel.classed("active", false).classed("inactive", true);
                break;
                }
            case "income":
                {
                povertyLabel.classed("active", false).classed("inactive", true);
                ageLabel.classed("active", false).classed("inactive", true);
                incomeLabel.classed("active", true).classed("inactive", false);
                break;
                }
          }

          // update circle label positions
          var circleLabels = renderCircleLabels(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

         }
      });

      labelsGroupY.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        
        if (value !== chosenYAxis) {
  
          // replaces chosenXAxis with value
          chosenYAxis = value;
  
          // console.log(chosenXAxis)
  
          // functions here found above csv import
          // updates x scale for new data
          yLinearScale = yScale(healthData, chosenYAxis);
  
          // updates x axis with transition
          yAxis = renderAxesY(yLinearScale, yAxis);
  
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

           
          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
  
         switch (chosenYAxis) {
              case "healthcare":
                  {
                  healthcareLabel.classed("active", true).classed("inactive", false);
                  smokesLabel.classed("active", false).classed("inactive", true);
                  obeseLabel.classed("active", false).classed("inactive", true);
                  break;
                  }
             case "smokes":
                 {
                    healthcareLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", true).classed("inactive", false);
                    obeseLabel.classed("active", false).classed("inactive", true);
                    break;
                 }
             case "obesity":
                 {
                    healthcareLabel.classed("active", false).classed("inactive", true);
                    smokesLabel.classed("active", false).classed("inactive", true);
                    obeseLabel.classed("active", true).classed("inactive", false);
                    break;
                 }
          }

          // update circle label positions
          var circleLabels = renderCircleLabels(circleLabels, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

        }
      });



      // End of event listener action for x axis
  });








