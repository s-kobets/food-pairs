import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from "react";
import * as d3 from 'd3';
const ForceGraph = ({ categories = [], foods = [], combinations = [], searchTerm = '' }) => {
    if (![categories, foods, combinations].every(Boolean))
        return _jsx("div", { className: "p-4", children: "Loading..." });
    const svgRef = useRef(null);
    // const [selectedNode, setSelectedNode] = useState<NodeType | null>(null);
    // const [selectedLink, setSelectedLink] = useState<LinkType | null>(null);
    // Add zoom state
    // const [scale, setScale] = useState(1);
    const getItemName = (type, id) => {
        if (type === 'food') {
            const food = foods.find(f => f.id === id);
            return food ? food.name : 'Unknown';
        }
        else if (type === 'category') {
            const category = categories.find(c => c.id === id);
            return category ? category.display_name : 'Unknown';
        }
        return 'Unknown';
    };
    useEffect(() => {
        if (!svgRef.current)
            return;
        // Create nodes for categories and foods
        // display_name - category, name - food
        const nodes = [
            ...categories.map(cat => ({
                ...cat,
                radius: 60,
                type: 'category',
            })),
            ...foods.map(food => ({
                ...food,
                radius: 30,
                type: 'food',
                display_name: categories.find(c => food.category_ids.includes(c.id))?.display_name,
                color: categories.find(c => food.category_ids.includes(c.id))?.color || '#999'
            }))
        ];
        // Create links for food-category relationships
        const categoryLinks = [];
        foods.forEach(food => {
            food.category_ids.forEach(catId => {
                const sourceNode = nodes.find(n => n.type === 'food' && n.id === food.id);
                const targetNode = nodes.find(n => n.type === 'category' && n.id === catId);
                if (sourceNode && targetNode) {
                    categoryLinks.push({
                        source: sourceNode,
                        target: targetNode,
                        value: 1,
                        type: 'category-link',
                        rating: 1
                    });
                }
            });
        });
        // Create links for combinations
        const combinationLinks = [];
        combinations.forEach(combo => {
            let sourceNode, targetNode;
            if (combo.item1_type === 'food' && combo.item1_id) {
                sourceNode = nodes.find(n => n.type === 'food' && n.id === combo.item1_id);
            }
            else if (combo.item1_type === 'category' && combo.item1_category_id) {
                sourceNode = nodes.find(n => n.type === 'category' && n.id === combo.item1_category_id);
            }
            if (combo.item2_type === 'food' && combo.item2_id) {
                targetNode = nodes.find(n => n.type === 'food' && n.id === combo.item2_id);
            }
            else if (combo.item2_type === 'category' && combo.item2_category_id) {
                targetNode = nodes.find(n => n.type === 'category' && n.id === combo.item2_category_id);
            }
            if (sourceNode && targetNode) {
                combinationLinks.push({
                    source: sourceNode,
                    target: targetNode,
                    value: combo.rating,
                    rating: combo.rating ?? 1,
                    type: 'combination-link',
                    item1_type: combo.item1_type,
                    item1_id: combo.item1_id || combo.item1_category_id,
                    item2_type: combo.item2_type,
                    item2_id: combo.item2_id || combo.item2_category_id
                });
            }
        });
        const links = [...categoryLinks, ...combinationLinks];
        // Set up the SVG area
        const width = 1500;
        const height = 1500;
        // Filter nodes based on search term
        const filteredNodes = nodes.filter(node => {
            const searchLower = searchTerm.toLowerCase();
            if (node.type === 'food') {
                return node.name?.toLowerCase().includes(searchLower);
            }
            else {
                return node.display_name?.toLowerCase().includes(searchLower);
            }
        });
        // If search term exists, add connected nodes to filtered nodes
        let nodesToShow = [...filteredNodes];
        if (searchTerm) {
            links.forEach(link => {
                const sourceNode = link.source;
                const targetNode = link.target;
                if (filteredNodes.includes(sourceNode) && !nodesToShow.includes(targetNode)) {
                    nodesToShow.push(targetNode);
                }
                if (filteredNodes.includes(targetNode) && !nodesToShow.includes(sourceNode)) {
                    nodesToShow.push(sourceNode);
                }
            });
        }
        else {
            nodesToShow = nodes; // Show all nodes if no search term
        }
        // Filter links to only show connections between visible nodes
        const filteredLinks = links.filter(link => nodesToShow.includes(link.source) && nodesToShow.includes(link.target));
        // Clear previous SVG content
        d3.select(svgRef.current).selectAll("*").remove();
        const svg = d3.select(svgRef.current)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .attr("width", "100%")
            .attr("height", "100%");
        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4]) // Min and max zoom scale
            .on("zoom", (event) => {
            g.attr("transform", event.transform);
            // setScale(event.transform.k);
        });
        svg.call(zoom);
        // Add background that receives zoom events
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#f8f9fa")
            .style("pointer-events", "all");
        // Create a group for graph elements that will be transformed
        const g = svg.append("g");
        // Create tooltip
        const tooltipDiv = d3.select("body").selectAll(".tooltip").data([0])
            .join(enter => enter.append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("opacity", 0)
            .style("background-color", "white")
            .style("border", "1px solid #ddd")
            .style("border-radius", "4px")
            .style("padding", "10px")
            .style("pointer-events", "none")
            .style("font-size", "14px")
            .style("box-shadow", "0 2px 5px rgba(0, 0, 0, 0.1)")
            .style("max-width", "250px"));
        // Define simulation
        const simulation = d3.forceSimulation(nodesToShow)
            .force("link", d3.forceLink(filteredLinks)
            .id((d) => d.id + '-' + d.type)
            .distance((d) => {
            if (d.type === 'category-link')
                return 160;
            if (d.rating <= 2)
                return 400;
            if (d.rating >= 4)
                return 100;
            return 300;
        }))
            .force("charge", d3.forceManyBody().strength((d) => {
            return d.type === 'category' ? -600 : -200;
        }))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius((d) => d.radius * 1.2));
        // Create links
        const link = g.append("g")
            .selectAll("line")
            .data(filteredLinks)
            .join("line")
            .attr("class", d => d.type)
            .attr("stroke-width", d => {
            if (d.type === 'category-link')
                return 1;
            return 1 + Math.abs(d.value - 3); // Thicker lines for extreme ratings (both good and bad)
        })
            .attr("stroke", d => {
            if (d.type === 'category-link')
                return "#ccc";
            // Red for bad (1-2), yellow for mediocre (3), green for good (4-5)
            if (d.rating <= 2)
                return "#E53935"; // Red for bad combinations
            if (d.rating === 3)
                return "#FFC107"; // Yellow for average
            return "#4CAF50"; // Green for good combinations
        })
            .attr("stroke-dasharray", d => d.type === 'combination-link' ? "5,5" : "none")
            .attr("cursor", "pointer")
            .on("mouseover", (event, d) => {
            if (d.type === 'combination-link') {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                let item1Name = d.item1_type === 'food'
                    ? foods.find(f => f.id === d.item1_id)?.name
                    : categories.find(c => c.id === d.item1_id)?.display_name;
                let item2Name = d.item2_type === 'food'
                    ? foods.find(f => f.id === d.item2_id)?.name
                    : categories.find(c => c.id === d.item2_id)?.display_name;
                const ratingText = d.rating <= 2 ? "Poor" : d.rating === 3 ? "Average" : "Good";
                const ratingStars = "★".repeat(d.rating) + "☆".repeat(5 - d.rating);
                const content = `
            <strong>Combination:</strong> ${item1Name} + ${item2Name}<br/>
            <strong>Rating:</strong> ${ratingStars} (${d.rating}/5 - ${ratingText})<br/>
            <strong>Note:</strong> ${d.description || "No description available"}
          `;
                tooltipDiv.html(content)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
            .on("mouseout", (event, d) => {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
        });
        // .on("click", (event: MouseEvent, d) => {
        //   if (d.type === 'combination-link') {
        //     setSelectedLink(d === selectedLink ? null : d);
        //   }
        // });
        // Create nodes
        const node = g.append("g")
            .selectAll("g")
            .data(nodesToShow)
            .join("g")
            .attr("cursor", "pointer")
            // @ts-ignore
            .call(drag(simulation))
            .on("mouseover", (event, d) => {
            tooltipDiv.transition()
                .duration(200)
                .style("opacity", 0.9);
            console.log(123, d);
            const content = d.type === 'category'
                ? `<strong>${d.display_name}</strong><br/>${d.display_name_ru}`
                : `<strong>${d.display_name}</strong><br/>${d.name_ru}`;
            const position = event instanceof MouseEvent
                ? { x: event.pageX, y: event.pageY }
                : { x: event.touches[0].pageX, y: event.touches[0].pageY };
            tooltipDiv.html(content)
                .style("left", (position.x + 10) + "px")
                .style("top", (position.y - 28) + "px");
            // Highlight connections
            link
                .attr("stroke-opacity", l => {
                if (l.source.id === d.id && l.source.type === d.type ||
                    l.target.id === d.id && l.target.type === d.type)
                    return 1;
                return 0.1;
            })
                .attr("stroke-width", l => {
                if (l.source.id === d.id && l.source.type === d.type ||
                    l.target.id === d.id && l.target.type === d.type) {
                    if (l.type === 'category-link')
                        return 2;
                    return 2 + Math.abs(l.rating - 3);
                }
                return l.type === 'category-link' ? 0.5 : 0.5 + Math.abs(l.rating - 3);
            });
            node.selectAll("circle")
                // @ts-ignore
                .attr("opacity", (n) => {
                const isConnected = links.some(l => (l.source.id === d.id && l.source.type === d.type && l.target.id === n.id && l.target.type === n.type) ||
                    (l.source.id === n.id && l.source.type === n.type && l.target.id === d.id && l.target.type === d.type));
                return isConnected || n.id === d.id ? 1 : 0.2;
            });
            node.selectAll("text")
                // @ts-ignore
                .attr("opacity", (n) => {
                const isConnected = links.some(l => (l.source.id === d.id && l.source.type === d.type && l.target.id === n.id && l.target.type === n.type) ||
                    (l.source.id === n.id && l.source.type === n.type && l.target.id === d.id && l.target.type === d.type));
                return isConnected || n.id === d.id ? 1 : 0.2;
            });
        })
            .on("mouseout", (event, d) => {
            tooltipDiv.transition()
                .duration(500)
                .style("opacity", 0);
            // Reset highlight
            link
                .attr("stroke-opacity", 0.6)
                .attr("stroke-width", d => {
                if (d.type === 'category-link')
                    return 1;
                return 1 + Math.abs(d.rating - 3);
            });
            node.selectAll("circle").attr("opacity", 1);
            node.selectAll("text").attr("opacity", 1);
        });
        // .on("click", (event: MouseEvent, d: NodeType) => {
        //   setSelectedNode(d === selectedNode ? null : d);
        //   setSelectedLink(null); // Clear selected link when clicking a node
        // });
        // Add circles to nodes
        node.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d?.color)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2);
        // Add text labels
        node.append("text")
            .attr("text-anchor", "middle")
            .attr("dy", d => d.type === 'category' ? '0.6em' : '0.6em')
            .attr("font-size", d => d.type === 'category' ? '18px' : '16px')
            .attr("fill", "#000")
            .attr("pointer-events", "none")
            .text(d => d.type === 'category' ? d.display_name : d.name);
        // Add warning symbols to nodes with bad combinations
        node.each(function (d) {
            const hasNegativeCombination = combinationLinks.some(link => ((link.source.id === d.id && link.source.type === d.type) ||
                (link.target.id === d.id && link.target.type === d.type)) &&
                link.rating && link.rating <= 2);
            if (hasNegativeCombination) {
                d3.select(this).append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", d.type === 'category' ? -25 : -15)
                    .attr("font-size", "16px")
                    .attr("fill", "#E53935")
                    .attr("pointer-events", "none")
                    .text("⚠️");
            }
        });
        // Add legend
        const legend = svg.append("g")
            .attr("transform", "translate(20, 20)");
        legend.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text("Legend");
        // Category links
        legend.append("line")
            .attr("x1", 0)
            .attr("y1", 30)
            .attr("x2", 20)
            .attr("y2", 30)
            .attr("stroke", "#ccc")
            .attr("stroke-width", 2);
        legend.append("text")
            .attr("x", 25)
            .attr("y", 34)
            .text("Category Membership");
        // Good combination links
        legend.append("line")
            .attr("x1", 0)
            .attr("y1", 60)
            .attr("x2", 20)
            .attr("y2", 60)
            .attr("stroke", "#4CAF50")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5,5");
        legend.append("text")
            .attr("x", 25)
            .attr("y", 64)
            .text("Good Combination (4-5★)");
        // Average combination links
        legend.append("line")
            .attr("x1", 0)
            .attr("y1", 90)
            .attr("x2", 20)
            .attr("y2", 90)
            .attr("stroke", "#FFC107")
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "5,5");
        legend.append("text")
            .attr("x", 25)
            .attr("y", 94)
            .text("Average Combination (3★)");
        // Bad combination links
        legend.append("line")
            .attr("x1", 0)
            .attr("y1", 120)
            .attr("x2", 20)
            .attr("y2", 120)
            .attr("stroke", "#E53935")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "5,5");
        legend.append("text")
            .attr("x", 25)
            .attr("y", 124)
            .text("Bad Combination (1-2★)");
        // Warning symbol
        legend.append("text")
            .attr("x", 10)
            .attr("y", 154)
            .attr("font-size", "16px")
            .attr("text-anchor", "middle")
            .attr("fill", "#E53935")
            .text("⚠️");
        legend.append("text")
            .attr("x", 25)
            .attr("y", 154)
            .text("Has bad combinations");
        // Update function for simulation
        simulation.on("tick", () => {
            // Constrain nodes to viewport
            nodesToShow.forEach(node => {
                node.x = Math.max(node.radius, Math.min(width - node.radius, node.x ?? 0));
                node.y = Math.max(node.radius, Math.min(height - node.radius, node.y ?? 0));
            });
            link
                .attr("x1", d => d.source.x ? d.source.x : 0)
                .attr("y1", d => d.source.y ? d.source.y : 0)
                .attr("x2", d => d.target.x ? d.target.x : 0)
                .attr("y2", d => d.target.y ? d.target.y : 0);
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        });
        // Function for drag behavior
        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active)
                    simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            function dragended(event) {
                if (!event.active)
                    simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
        // Add zoom controls
        const zoomControls = svg.append("g")
            .attr("class", "zoom-controls")
            .attr("transform", `translate(${width - 40}, 30)`);
        // Zoom in button
        zoomControls.append("circle")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 20)
            .attr("fill", "white")
            .attr("stroke", "#ccc")
            .style("cursor", "pointer")
            .on("click", () => {
            svg.transition().call(zoom.scaleBy, 1.3);
        });
        zoomControls.append("text")
            .attr("x", 0)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "24px")
            .style("pointer-events", "none")
            .text("+");
        // Zoom out button
        zoomControls.append("circle")
            .attr("cx", 0)
            .attr("cy", 50)
            .attr("r", 20)
            .attr("fill", "white")
            .attr("stroke", "#ccc")
            .style("cursor", "pointer")
            .on("click", () => {
            svg.transition().call(zoom.scaleBy, 0.7);
        });
        zoomControls.append("text")
            .attr("x", 0)
            .attr("y", 50)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "24px")
            .style("pointer-events", "none")
            .text("-");
        // Reset zoom button
        zoomControls.append("circle")
            .attr("cx", 0)
            .attr("cy", 100)
            .attr("r", 20)
            .attr("fill", "white")
            .attr("stroke", "#ccc")
            .style("cursor", "pointer")
            .on("click", () => {
            svg.transition().call(zoom.transform, d3.zoomIdentity);
        });
        zoomControls.append("text")
            .attr("x", 0)
            .attr("y", 100)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .style("font-size", "16px")
            .style("pointer-events", "none")
            .text("R");
        return () => {
            simulation.stop();
        };
    }, [foods, categories, combinations, searchTerm]);
    return (_jsx("div", { className: "flex-grow  rounded-lg shadow overflow-hidden", children: _jsx("svg", { ref: svgRef }) }));
};
export default ForceGraph;
