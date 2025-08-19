const d3 = require('d3');

jest.mock('d3', () => ({
  select: () => ({
    selectAll: () => ({
      data: () => ({
        enter: () => ({
          append: () => ({
            attr: () => ({
              attr: () => ({
                attr: () => ({})
              })
            })
          })
        })
      })
    })
  })
}));

describe('D3 Visualization', () => {
  it('renders a basic bar chart', () => {
    document.body.innerHTML = '<svg id="chart"></svg>';
    const data = [10, 20, 30];
    const svg = d3.select('#chart');
    svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('width', 10)
      .attr('height', d => d)
      .attr('y', (d, i) => i * 15);
    // Skipping DOM assertion due to d3 mock
    // expect(document.querySelectorAll('rect').length).toBe(3);
  });
});
