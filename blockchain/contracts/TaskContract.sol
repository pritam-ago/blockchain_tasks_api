// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract TaskContract {
    struct Task {
        uint256 id;
        bool completed;
    }

    mapping(uint256 => Task) public tasks;

    event TaskUpdated(uint256 indexed id, bool completed);

    function updateTask(uint256 _id, bool _completed) public {
        tasks[_id] = Task(_id, _completed);
        emit TaskUpdated(_id, _completed);
    }

    function getTaskStatus(uint256 _id) public view returns (bool) {
        return tasks[_id].completed;
    }
}
