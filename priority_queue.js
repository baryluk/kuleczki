/* Priority queue
 * Copyright: Witold Baryluk, 2011
 */

/*
 *
 *
 * We will need:
 *  Per ball priority queues.
 *    In each such queue we will have sorted times to impact with each other ball and walls.
 *          We can ignore and do not add to queue a balls which will impact in time grater than impact to the wall. It is impossible to hit such ball under any cirumstences.
 *          This can also be detected by locating where will be point of impact, and determining if both balls will be on correct side of walls.
 *    We will need possibility to delete any element (based on the id of second ball) from queue. And insert it again possibly with different time (smaller or lower).
 *    We will need fast access to any element in queue (hash table will be simplest), so we can locate it in the queue quickly, and remove it quickly from queue.
 *    We will need fast destruction of whole queue, as well creation of whole queue from scratch.
 *    Every time a smallest element is changed (becuase it is dequeued, queue is recreated from scratch, or it is deleted from queue and reinserted with different time).,
 *        we need to update global queue entry coreposnding to this queue.
 *
 *  Global queue:
 *   Global queue will have essentially same characteristics as per ball queue.
 *   It will have pointers to the per ball queues, and will be ordered by the time in the first entry in each queue.
 *
 * Note: inter-ball collisions can be merged into single entry in global queue, as they would represented two times in this queue.
 *       this merged entry still will have pointers to both per ball queues however.
 *
 * =============================================================================
 * Example:  6 balls.
 *
 *
 * Q1   [ 3.4 with B2, 4.5 with B3, 5.6 with WALL, (rest ignored) ]
 * Q2   [ 3.4 with B1, 5.8 with B3, 8.0 with B4, 9.0 with B5, 11.0 with WALL ]
 * Q3   [ 4.5 with B1, 5.8 with B2, 6.3 with B4, 7.6 with WALL ]
 * Q4   [ 2.3 with B5, 6.3 with B3, 8.0 with B2, 15.0 with WALL ]
 * Q5   [ 2.3 with B4, 9.0 with B2, 10.0 with WALL ]
 * Q6   [ 6.0 with WALL ]
 *
 * QWALL [ 5.6 with B1, 6.0 with B6, 7.6 with B3, 10.0 with B5, 11.0 with B2, 15.0 with B4 ]
 *
 * QG   [ 2.3 with B4+B5, 3.4 with B1+B2, 4.0 B6+WALL, 5.6 with WALL+B1, 6.0 with B1+B4 ]
 *
 * In fact we can scan global queue and remove elements which duplicates.
 * For example in abve QG we can remove 5.6 (WALL+B1) and 6.0 (B1+B4), because at 3.4 we have B1+B2,
 * so this two elements will need to be removed anyway from queue after collision at 3.4,
 * it should be simiple to maintain it.
 *
 * =============================================================================
 *
 * How to maintain proper queues.
 *
 * Dequeue first element from QG, and determine what type of collision it is.
 * It queue is empty, there is no more possible collision, so simulation can run in free particle run.
 *
 * After collision Bx+By , we perform:
 *
 * Dequeue collisio nfrom QG.
 * For both w == x and y:
 *   Destroy Qw:
 *   Remove Bw from all other Q*, QWALL.
 *   Remove remaining entries Bw from QG (there still may be some entries in QG, if not inserted properly).
 *   Calculate wall time collisions for Bw
 *   Recreate Qw from scratch, remembering we do not need to add any collisions happenning after collision with wall.
 *   Insert wall time collisions to both Qw (it will be at the end, if any), as well into QWALL.
 *   When creating queue Qw, remeber to update (n-2) entries in (n-2) remaning Qz queues, by deleting old entry (if any) and reinsterting it back,
 *       possibly ignoring insertion in case new collision time is larger than wall time collision of Qw or Qz.
 *   Insert wall time collision into queue Qw and QWALL.
 *   Insert smallest time of Qw into GQ.
 *
 * In fact creation of both Qx and Qy, needs to be partially interleaved.
 *   First destroy both.
 *   Calc wall time and create new queues, with this wall time in specal field.
 *   Insert new values.
 *
 * When creating queues, it would be good to make sure than By do not need to care about Bx, if x < y.
 *
 * After collision with Bw+QWALL:
 *
 * Dequeue from GQ and QWALL.
 * Destroy Qw.
 * Remove Bw from all Q* and remaining ones from QG. (There is no more Bw in QWALL, so do not need to update it now).
 * Recalculate wall time collision for Bw.
 * Recreate Qw from scrath, remembering we do not need to add any collision happening after collision with wall.
 * Insert wall time collisions to both Qw (it will be at the end, if any), as well into QWALL.
 * Insert smallest time of Qw into GQ.
 */

/* First we do naive implementation */
function PriorityQueue() {
	this.queue = [];
	this.sorted = false;
	this.size = function () {
		return this.queue.length;
	};
	this.add = function (key, value) {
		this.queue.push({key:key, value:value});
		this.sorted = false;
	};
	this.peek = function () {
		this.sort();
		return this.queue[0];
	};
	this.dequeue = function () {
		this.sort();
		var kv = this.queue[0];
		this.queue = this.queue.slice(1, this.queue.length);
		return kv;
	};
	this.sort = function () {
		if (!this.sorted) {
			this.queue.sort(function(a,b) { return a.key - b.key; });
			this.sorted = true;
		}
	};
	this.clear = function () {
		this.queue = [];
		this.sorted = false;
	};
}
