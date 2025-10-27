// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {SepoliaConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title OnchainDiary - 基于 FHEVM 的链上日记（单合约）
/// @notice 将日记内容的哈希与元数据上链，并用 FHE 同态计数跟踪用户日记数量。
/// @dev FHE 使用方式与 Zama 官方示例保持一致：
///      - 前端通过 createEncryptedInput 生成 externalEuint32 + inputProof
///      - 合约侧用 FHE.fromExternal 验证输入并导入为 euint32
///      - 使用 FHE.add 做同态累加
///      - 用 FHE.allowThis/FHE.allow 授权最新句柄给合约自身与调用者
contract OnchainDiary is SepoliaConfig {
    struct EntryMeta {
        // 存储日记内容哈希（如 keccak256(plaintext) 或 keccak256(ciphertext)）
        bytes32 contentHash;
        uint64 timestamp;
    }

    struct UserDiary {
        // 用户累计日记数量（密文）
        euint32 totalEntries;
        // 条目列表（仅存放哈希与时间戳，明文不在链上）
        EntryMeta[] entries;
    }

    mapping(address => UserDiary) private _diaries;

    event EntryWritten(address indexed user, bytes32 indexed contentHash, uint64 timestamp);

    /// @notice 写入一条日记
    /// @param contentHash 明文或密文的哈希（由前端计算）
    /// @param deltaEncrypted externalEuint32（通常前端传 1）
    /// @param inputProof 与 deltaEncrypted 对应的输入证明
    function writeEntry(
        bytes32 contentHash,
        externalEuint32 deltaEncrypted,
        bytes calldata inputProof
    ) external {
        // 记录条目（仅哈希 + 时间戳）
        _diaries[msg.sender].entries.push(EntryMeta({
            contentHash: contentHash,
            timestamp: uint64(block.timestamp)
        }));

        // 同态计数 + 授权
        euint32 delta = FHE.fromExternal(deltaEncrypted, inputProof);
        _diaries[msg.sender].totalEntries = FHE.add(_diaries[msg.sender].totalEntries, delta);

        FHE.allowThis(_diaries[msg.sender].totalEntries);
        FHE.allow(_diaries[msg.sender].totalEntries, msg.sender);

        emit EntryWritten(msg.sender, contentHash, uint64(block.timestamp));
    }

    /// @notice 获取用户的密文计数句柄
    function getEncryptedTotal(address user) external view returns (euint32) {
        return _diaries[user].totalEntries;
    }

    /// @notice 获取用户的条目元数据（仅哈希与时间戳）
    function getEntries(address user) external view returns (EntryMeta[] memory) {
        return _diaries[user].entries;
    }
}


