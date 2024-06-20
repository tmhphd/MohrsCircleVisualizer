document.getElementById('inputForm').addEventListener('submit', function(event) {
    event.preventDefault();
    drawMohrCircle();
    drawStressElement();
});

document.getElementById('angleSlider').addEventListener('input', function() {
    const angle = this.value;
    document.getElementById('angleValue').textContent = angle + '°';
    document.getElementById('angleInput').value = angle;
    drawMohrCircle();
    drawStressElement();
});

document.getElementById('angleInput').addEventListener('input', function() {
    const angle = this.value;
    document.getElementById('angleValue').textContent = angle + '°';
    document.getElementById('angleSlider').value = angle;
    drawMohrCircle();
    drawStressElement();
});

document.getElementById('findPrincipal').addEventListener('click', function() {
    findPrincipalStresses();
});

function drawMohrCircle() {
    const sigmaX = parseFloat(document.getElementById('sigmaX').value);
    const sigmaY = parseFloat(document.getElementById('sigmaY').value);
    const tauXY = parseFloat(document.getElementById('tauXY').value);
    const angle = parseFloat(document.getElementById('angleSlider').value);

    const center = (sigmaX + sigmaY) / 2;
    const radius = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));

    const angleRad = angle * Math.PI / 180.;
    const sigmaXPrime = (sigmaX + sigmaY) / 2 + (sigmaX - sigmaY) / 2 * Math.cos(2 * angleRad) + tauXY * Math.sin(2 * angleRad);
    const sigmaYPrime = (sigmaX + sigmaY) / 2 - (sigmaX - sigmaY) / 2 * Math.cos(2 * angleRad) - tauXY * Math.sin(2 * angleRad);
    const tauXYPrime = -(sigmaX - sigmaY) / 2 * Math.sin(2 * angleRad) + tauXY * Math.cos(2 * angleRad);
    const principalAngle = 0.5 * Math.atan2(2 * tauXY, sigmaX - sigmaY);
    const principalAngleDegrees = principalAngle * 180 / Math.PI;
    const sigma1 = center + radius;
    const sigma2 = center - radius;

    d3.select('#mohrCircle').selectAll('*').remove();

    const width = 500;
    const height = 500;
    const svg = d3.select('#mohrCircle')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const xScale = d3.scaleLinear()
        .domain([center - radius - 10, center + radius + 10])
        .range([-width / 2 + 100, width / 2 - 50]);

    const yScale = d3.scaleLinear()
        .domain([-radius - 10, radius + 10])
        .range([height / 2 - 100, -height / 2 + 50]);

    const xAxis = d3.axisBottom(xScale).ticks(10);
    const yAxis = d3.axisLeft(yScale).ticks(10);

    svg.append('g')
        .attr('transform', `translate(0,${yScale(0)})`)
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${xScale(0)},0)`)
        .call(yAxis);

    svg.append('circle')
        .attr('cx', xScale(center))
        .attr('cy', yScale(0))
        .attr('r', xScale(center + radius) - xScale(center))
        .attr('stroke', 'black')
        .attr('fill', 'none');

    svg.append('line')
        .attr('x1', xScale(center - radius - 10))
        .attr('x2', xScale(center + radius + 10))
        .attr('y1', yScale(0))
        .attr('y2', yScale(0))
        .attr('stroke', 'black');

    svg.append('line')
        .attr('x1', xScale(sigmaX))
        .attr('x2', xScale(sigmaY))
        .attr('y1', yScale(tauXY))
        .attr('y2', yScale(-tauXY))
        .attr('stroke', 'black');

    svg.append('line')
        .attr('x1', xScale(sigmaXPrime))
        .attr('x2', xScale(sigmaYPrime))
        .attr('y1', yScale(tauXYPrime))
        .attr('y2', yScale(-tauXYPrime))
        .attr('stroke', 'red');

    svg.append('text')
        .attr('x', xScale(center + radius + 10))
        .attr('y', yScale(1))
        .attr('text-anchor', 'end')
        .attr('font-size', '14px')
        .attr('fill', 'black')
        .text('σ');

    svg.append('text')
        .attr('x', xScale(1))
        .attr('y', yScale(radius + 10))
        .attr('text-anchor', 'start')
        .attr('font-size', '14px')
        .attr('fill', 'black')
        .text('𝜏');

    svg.append('circle')
        .attr('cx', xScale(sigmaXPrime))
        .attr('cy', yScale(tauXYPrime))
        .attr('r', 5)
        .attr('fill', 'blue');

    svg.append('circle')
        .attr('cx', xScale(sigmaYPrime))
        .attr('cy', yScale(-tauXYPrime))
        .attr('r', 5)
        .attr('fill', 'red');

    const arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(xScale(radius)/1.5)
        .startAngle(Math.PI/2-2*principalAngle)
        .endAngle(Math.PI/2-2*principalAngle+2*angleRad);

    svg.append('path')
        .attr('d', arcGenerator)
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1)
        .attr('transform', `translate(${xScale(center)}, ${yScale(0)})`);

    updateLabels(sigmaXPrime, sigmaYPrime, tauXYPrime, center, radius, principalAngleDegrees);
}

function drawStressElement() {
    const sigmaX = parseFloat(document.getElementById('sigmaX').value);
    const sigmaY = parseFloat(document.getElementById('sigmaY').value);
    const tauXY = parseFloat(document.getElementById('tauXY').value);
    const angle = parseFloat(document.getElementById('angleSlider').value);
    // const sigma1 = parseFloat(document.getElementById('sigma1').value);
    // const sigma2 = parseFloat(document.getElementById('sigma2').value);
    const center = (sigmaX + sigmaY) / 2;
    const radius = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));

    const angleRad = angle * Math.PI / 180;
    const sigmaXPrime = (sigmaX + sigmaY) / 2 + (sigmaX - sigmaY) / 2 * Math.cos(2 * angleRad) + tauXY * Math.sin(2 * angleRad);
    const sigmaYPrime = (sigmaX + sigmaY) / 2 - (sigmaX - sigmaY) / 2 * Math.cos(2 * angleRad) - tauXY * Math.sin(2 * angleRad);
    const tauXYPrime = -(sigmaX - sigmaY) / 2 * Math.sin(2 * angleRad) + tauXY * Math.cos(2 * angleRad);
    const sigma1 = center + radius;
    const sigma2 = center - radius;

    const rectSize = 100;
    //const scaleFactor = rectSize/1.5*(Math.max(sigmaX,sigmaY,tauXY)/Math.max(Math.abs(sigma1),Math.abs(sigma2),radius)); // Adjust to control the length of the arrows
    //console.log(scaleFactor);
    //const scaleFactor = 2;
    const maxstress = Math.max(Math.abs(sigma1),Math.abs(sigma2),radius);
    d3.select('#stressElement').selectAll('*').remove();

    const svg = d3.select('#stressElement')
        .append('svg')
        .attr('width', 200)
        .attr('height', 200)
        .append('g')
        .attr('transform', 'translate(100, 100)');

    const coords = [
        { x: -rectSize / 2, y: -rectSize / 2 },
        { x: rectSize / 2, y: -rectSize / 2 },
        { x: rectSize / 2, y: rectSize / 2 },
        { x: -rectSize / 2, y: rectSize / 2 }
    ];

    const transformedCoords = coords.map(coord => {
        const x = coord.x * Math.cos(angleRad) - coord.y * Math.sin(angleRad);
        const y = coord.x * Math.sin(angleRad) + coord.y * Math.cos(angleRad);
        return { x, y };
    });

    svg.append('polygon')
        .attr('points', transformedCoords.map(d => `${d.x},${d.y}`).join(' '))
        .attr('stroke', 'black')
        .attr('fill', 'none');

    function drawArrow(x1, y1, x2, y2, color) {
        svg.append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', color)
            .attr('stroke-width', 2);

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 5;
        const arrowHeadPoints = [
            { x: x2, y: y2 },
            { x: x2 - headLength * Math.cos(angle - Math.PI / 6), y: y2 - headLength * Math.sin(angle - Math.PI / 6) },
            { x: x2 - headLength * Math.cos(angle + Math.PI / 6), y: y2 - headLength * Math.sin(angle + Math.PI / 6) }
        ];

        svg.append('polygon')
            .attr('points', arrowHeadPoints.map(p => `${p.x},${p.y}`).join(' '))
            .attr('fill', color);
    }
    function drawYArrow(x1, y1, x2, y2, color) {
        svg.append('line')
            .attr('x1', x1)
            .attr('y1', y1)
            .attr('x2', x2)
            .attr('y2', y2)
            .attr('stroke', color)
            .attr('stroke-width', 2);

        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 5;
        const arrowHeadPoints = [
            { x: x2, y: y2 },
            { x: x2 - headLength * Math.cos(angle - Math.PI / 6), y: y2 - headLength * Math.sin(angle - Math.PI / 6) },
            { x: x2 - headlength * Math.cos(angle + Math.PI / 6), y: y2 - headLength * Math.sin(angle + Math.PI / 6) }
        ];

        svg.append('polygon')
            .attr('points', arrowHeadPoints.map(p => `${p.x},${p.y}`).join(' '))
            .attr('fill', color);
    }

    const stressXPoints = [
        { x: rectSize / 2+5, y: 0, stress: sigmaXPrime },
        { x: -rectSize / 2-5, y: 0, stress: -sigmaXPrime },
    ];

    stressXPoints.forEach(p => {
        const x1 = p.x * Math.cos(angleRad) - p.y * Math.sin(angleRad);
        const y1 = p.x * Math.sin(angleRad) + p.y * Math.cos(angleRad);
        const x2 = x1 + rectSize/2*p.stress/maxstress * Math.cos(angleRad);
        const y2 = y1 + rectSize/2*p.stress/maxstress * Math.sin(angleRad);
        drawArrow(x1, y1, x2, y2, 'blue');
    });

    const stressYPoints = [
        { x: 0, y: rectSize / 2+5, stress: sigmaYPrime },
        { x: 0, y: -rectSize / 2-5, stress: -sigmaYPrime }
    ];

    stressYPoints.forEach(p => {
        const x1 = p.x * Math.cos(angleRad) - p.y * Math.sin(angleRad);
        const y1 = p.x * Math.sin(angleRad) + p.y * Math.cos(angleRad);
        const y2 = y1 + rectSize/2 * p.stress/maxstress * Math.cos(angleRad);
        const x2 = x1 - rectSize/2 * p.stress/maxstress * Math.sin(angleRad);
        drawArrow(x1, y1, x2, y2, 'red');
    });

    const shearStressPoints = [
        { x1: -rectSize/2 * tauXYPrime/maxstress, y1: rectSize / 2+5, x2: rectSize/2 * tauXYPrime/maxstress, y2: rectSize / 2 + 5},
        { x1: rectSize/2 * tauXYPrime/maxstress, y1: -rectSize / 2 - 5, x2: -rectSize/2 * tauXYPrime/maxstress, y2: -rectSize / 2 - 5 },
        { x1: -rectSize/2-5, y1: rectSize/2 * tauXYPrime/maxstress, x2: -rectSize/2-5, y2: -rectSize/2 * tauXYPrime/maxstress },
        { x1: rectSize/2+5, y1: -rectSize/2 * tauXYPrime/maxstress, x2: rectSize/2+5, y2: rectSize/2 * tauXYPrime/maxstress }
    ];

    shearStressPoints.forEach(p => {
        const x1 = p.x1 * Math.cos(angleRad) - p.y1 * Math.sin(angleRad);
        const y1 = p.x1 * Math.sin(angleRad) + p.y1 * Math.cos(angleRad);
        const x2 = p.x2 * Math.cos(angleRad) - p.y2 * Math.sin(angleRad);
        const y2 = p.x2 * Math.sin(angleRad) + p.y2 * Math.cos(angleRad);
        drawArrow(x1, y1, x2, y2, 'green');
    });

    svg.append('line')
        .attr('x1', 0)
        .attr('x2', rectSize/3)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', 'black');


        svg.append('line')
        .attr('x1', 0)
        .attr('x2', Math.cos(angleRad)*rectSize/3)
        .attr('y1', 0)
        .attr('y2', Math.sin(angleRad)*rectSize/3)
        .attr('stroke', 'red');

const arcGenerator = d3.arc()
    .innerRadius(0)
    .outerRadius(rectSize/5)
    .startAngle(Math.PI/2)
    .endAngle(Math.PI/2+angleRad);

svg.append('path')
    .attr('d', arcGenerator)
    .attr('fill', 'none')
    .attr('stroke', 'black')
    .attr('stroke-width', 1)
    .attr('transform', `translate(${xScale(center)}, ${yScale(0)})`);

    updateLabels(sigmaXPrime, sigmaYPrime, tauXYPrime, (sigmaX + sigmaY) / 2, Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2)), angle);
}

function updateLabels(sigmaXPrime, sigmaYPrime, tauXYPrime, center, radius, angle) {
    document.getElementById('sigmaXPrime').textContent = sigmaXPrime.toFixed(2);
    document.getElementById('sigmaYPrime').textContent = sigmaYPrime.toFixed(2);
    document.getElementById('tauXYPrime').textContent = tauXYPrime.toFixed(2);
    document.getElementById('sigma1').textContent = (center + radius).toFixed(2);
    document.getElementById('sigma2').textContent = (center - radius).toFixed(2);
    document.getElementById('tauMax').textContent = radius.toFixed(2);

    const principalAngle = Math.atan2(2 * tauXYPrime, sigmaXPrime - sigmaYPrime) / 2;
    document.getElementById('principalAngle').textContent = (principalAngle * 180 / Math.PI).toFixed(2);
}

function findPrincipalStresses() {
    const sigmaX = parseFloat(document.getElementById('sigmaX').value);
    const sigmaY = parseFloat(document.getElementById('sigmaY').value);
    const tauXY = parseFloat(document.getElementById('tauXY').value);

    const center = (sigmaX + sigmaY) / 2;
    const radius = Math.sqrt(Math.pow((sigmaX - sigmaY) / 2, 2) + Math.pow(tauXY, 2));

    const principalAngle = 0.5 * Math.atan2(2 * tauXY, sigmaX - sigmaY);
    const principalAngleDegrees = principalAngle * 180 / Math.PI;
    aslider = parseFloat(document.getElementById('angleSlider').value);

    if (aslider*1.02 > principalAngleDegrees && aslider*0.98 < principalAngleDegrees){
        const maxShearAngle = principalAngle-Math.PI/4;
        const principalAngleDegrees = maxShearAngle * 180 / Math.PI;

        document.getElementById('angleSlider').value = principalAngleDegrees;
        document.getElementById('angleValue').textContent = principalAngleDegrees.toFixed(2) + '°';
        document.getElementById('angleInput').value = principalAngleDegrees.toFixed(2);
        
        drawMohrCircle();
        drawStressElement();
    } else{

        document.getElementById('angleSlider').value = principalAngleDegrees;
        document.getElementById('angleValue').textContent = principalAngleDegrees.toFixed(2) + '°';
        document.getElementById('angleInput').value = principalAngleDegrees.toFixed(2);

        drawMohrCircle();
        drawStressElement();
    }
}

function updateLabels(sigmaXPrime, sigmaYPrime, tauXYPrime, center, radius, principalAngleDegrees) {
    document.getElementById('sigmaXPrime').textContent = `σx' = ${sigmaXPrime.toFixed(2)}`;
    document.getElementById('sigmaYPrime').textContent = `σy' = ${sigmaYPrime.toFixed(2)}`;
    document.getElementById('tauXYPrime').textContent = `τxy' = ${tauXYPrime.toFixed(2)}`;

    const sigma1 = center + radius;
    const sigma2 = center - radius;
    const tauMax = radius;


    document.getElementById('sigma1').textContent = `σ1 = ${sigma1.toFixed(2)}`;
    document.getElementById('sigma2').textContent = `σ2 = ${sigma2.toFixed(2)}`;
    document.getElementById('tauMax').textContent = `τmax = ${tauMax.toFixed(2)}`;

    document.getElementById('AngleLabel').textContent = `Current Angle:`;
    document.getElementById('principalAngle').textContent = `θ = ${principalAngleDegrees.toFixed(2)}°`;
    document.getElementById('TwoPrincipalAngle').textContent = `2θ = ${2*principalAngleDegrees.toFixed(2)}°`;

}
